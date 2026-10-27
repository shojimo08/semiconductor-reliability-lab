import { lifetimeFromExponential, weibullCdf, weibullHazard, weibullSurvival } from '../math/weibull.ts'
import { sampleUnitExponentials } from '../math/random.ts'

export interface ComponentSample {
  id: number
  row: number
  column: number
  baseDraw: number
  lifetime: number
}

export function createComponents(count: number, seed: number, beta: number, eta: number): ComponentSample[] {
  const columns = Math.ceil(Math.sqrt(count))
  return sampleUnitExponentials(count, seed).map((baseDraw, id) => ({
    id,
    row: Math.floor(id / columns),
    column: id % columns,
    baseDraw,
    lifetime: lifetimeFromExponential(baseDraw, beta, eta),
  }))
}

export function transformComponents(samples: ComponentSample[], beta: number, eta: number): ComponentSample[] {
  return samples.map((sample) => ({
    ...sample,
    lifetime: lifetimeFromExponential(sample.baseDraw, beta, eta),
  }))
}

export function survivalCounts(samples: ComponentSample[], time: number) {
  if (!Number.isFinite(time) || time < 0) throw new RangeError('time must be finite and >= 0')
  if (samples.length === 0) return { surviving: 0, failed: 0, fraction: 0 }
  const surviving = samples.reduce((sum, sample) => sum + Number(sample.lifetime > time), 0)
  return { surviving, failed: samples.length - surviving, fraction: surviving / samples.length }
}

export interface ChartPoint {
  time: number
  theoretical: number
  empirical: number
  cdf: number
  hazard: number | null
}

export function buildChartData(samples: ComponentSample[], beta: number, eta: number, maxTime: number, points = 81): ChartPoint[] {
  if (!Number.isFinite(maxTime) || maxTime <= 0) throw new RangeError('maxTime must be finite and > 0')
  if (!Number.isInteger(points) || points < 2) throw new RangeError('points must be an integer >= 2')
  return Array.from({ length: points }, (_, index) => {
    const time = (maxTime * index) / (points - 1)
    return {
      time,
      theoretical: weibullSurvival(time, beta, eta),
      empirical: survivalCounts(samples, time).fraction,
      cdf: weibullCdf(time, beta, eta),
      hazard: time === 0 ? null : weibullHazard(time, beta, eta),
    }
  })
}
