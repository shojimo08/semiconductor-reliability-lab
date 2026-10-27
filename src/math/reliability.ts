import { validateWeibull } from './weibull.ts'

function validateNonnegativeTime(t: number): void {
  if (!Number.isFinite(t) || t < 0) throw new RangeError('time must be finite and >= 0')
}

function validatePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and > 0`)
}

export function weibullCumulativeHazard(t: number, beta: number, eta: number): number {
  validateWeibull(beta, eta)
  validateNonnegativeTime(t)
  return Math.pow(t / eta, beta)
}

export function weibullPdf(t: number, beta: number, eta: number): number {
  validateWeibull(beta, eta)
  validateNonnegativeTime(t)
  if (t === 0) {
    if (beta < 1) return Number.POSITIVE_INFINITY
    if (beta === 1) return 1 / eta
    return 0
  }
  const cumulativeHazard = weibullCumulativeHazard(t, beta, eta)
  return (beta / eta) * Math.pow(t / eta, beta - 1) * Math.exp(-cumulativeHazard)
}

/** P(t < T <= t + delta | T > t), evaluated through cumulative-hazard increments. */
export function conditionalFailureProbability(age: number, delta: number, beta: number, eta: number): number {
  validateNonnegativeTime(age)
  validateNonnegativeTime(delta)
  validateWeibull(beta, eta)
  if (delta === 0) return 0

  // Compute ΔH = H(age + delta) - H(age) without subtracting two values that
  // may both overflow. For age > 0: ΔH = H(age) * [(1 + delta/age)^beta - 1].
  const logHazardIncrement = age === 0
    ? beta * Math.log(delta / eta)
    : beta * Math.log(age / eta) + Math.log(Math.expm1(beta * Math.log1p(delta / age)))

  if (logHazardIncrement >= Math.log(Number.MAX_VALUE)) return 1
  if (logHazardIncrement <= Math.log(Number.MIN_VALUE)) return 0
  const hazardIncrement = Math.exp(logHazardIncrement)
  return -Math.expm1(-hazardIncrement)
}

export function exponentialHazard(lambda: number): number {
  validatePositive(lambda, 'lambda')
  return lambda
}

export function exponentialReliability(t: number, lambda: number): number {
  validateNonnegativeTime(t)
  return Math.exp(-exponentialHazard(lambda) * t)
}

export function gompertzCumulativeHazard(t: number, a: number, b: number): number {
  validateNonnegativeTime(t)
  validatePositive(a, 'a')
  validatePositive(b, 'b')
  return (a / b) * Math.expm1(b * t)
}

export function gompertzHazard(t: number, a: number, b: number): number {
  validateNonnegativeTime(t)
  validatePositive(a, 'a')
  validatePositive(b, 'b')
  return a * Math.exp(b * t)
}

export function gompertzReliability(t: number, a: number, b: number): number {
  return Math.exp(-gompertzCumulativeHazard(t, a, b))
}

export interface ModelComparisonPoint {
  time: number
  exponentialReliability: number
  weibullReliability: number
  gompertzReliability: number
  exponentialHazard: number
  weibullHazard: number | null
  gompertzHazard: number
}

export function buildModelComparison(beta: number, eta: number, maxTime: number, points = 81): ModelComparisonPoint[] {
  validateWeibull(beta, eta)
  validatePositive(maxTime, 'maxTime')
  if (!Number.isInteger(points) || points < 2) throw new RangeError('points must be an integer >= 2')
  const lambda = 1 / eta
  const gompertzA = 0.45 / eta
  const gompertzB = 0.08
  return Array.from({ length: points }, (_, index) => {
    const time = maxTime * index / (points - 1)
    const weibullH = weibullCumulativeHazard(time, beta, eta)
    return {
      time,
      exponentialReliability: exponentialReliability(time, lambda),
      weibullReliability: Math.exp(-weibullH),
      gompertzReliability: gompertzReliability(time, gompertzA, gompertzB),
      exponentialHazard: exponentialHazard(lambda),
      weibullHazard: time === 0 && beta < 1 ? null : time === 0 ? (beta === 1 ? 1 / eta : 0) : (beta / eta) * Math.pow(time / eta, beta - 1),
      gompertzHazard: gompertzHazard(time, gompertzA, gompertzB),
    }
  })
}
