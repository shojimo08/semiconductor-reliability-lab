export interface WeibullParameters {
  beta: number
  eta: number
}

export function validateWeibull(beta: number, eta: number): void {
  if (!Number.isFinite(beta) || beta <= 0) throw new RangeError('beta must be finite and > 0')
  if (!Number.isFinite(eta) || eta <= 0) throw new RangeError('eta must be finite and > 0')
}

function validateTime(t: number): void {
  if (!Number.isFinite(t) || t < 0) throw new RangeError('time must be finite and >= 0')
}

export function weibullSurvival(t: number, beta: number, eta: number): number {
  validateWeibull(beta, eta)
  validateTime(t)
  return Math.exp(-Math.pow(t / eta, beta))
}

export function weibullCdf(t: number, beta: number, eta: number): number {
  validateWeibull(beta, eta)
  validateTime(t)
  return -Math.expm1(-Math.pow(t / eta, beta))
}

/** Hazard is defined only for t > 0. */
export function weibullHazard(t: number, beta: number, eta: number): number {
  validateWeibull(beta, eta)
  if (!Number.isFinite(t) || t <= 0) throw new RangeError('hazard requires time > 0')
  return (beta / eta) * Math.pow(t / eta, beta - 1)
}

/** Transform one Exp(1) draw into a Weibull lifetime. */
export function lifetimeFromExponential(baseDraw: number, beta: number, eta: number): number {
  validateWeibull(beta, eta)
  if (!Number.isFinite(baseDraw) || baseDraw <= 0) throw new RangeError('baseDraw must be finite and > 0')
  return eta * Math.pow(baseDraw, 1 / beta)
}
