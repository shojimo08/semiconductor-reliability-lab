import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sampleUnitExponentials } from './random.ts'
import { lifetimeFromExponential, weibullCdf, weibullHazard, weibullSurvival } from './weibull.ts'
import { buildChartData, createComponents, survivalCounts, transformComponents } from '../sim/components.ts'

describe('Weibull formulas', () => {
  it('has R(0)=1, F(0)=0 and R+F=1', () => {
    assert.equal(weibullSurvival(0, 1.7, 8), 1)
    assert.equal(weibullCdf(0, 1.7, 8), 0)
    for (const t of [0, 0.01, 1, 8, 50]) {
      assert.ok(Math.abs(weibullSurvival(t, 1.7, 8) + weibullCdf(t, 1.7, 8) - 1) < 1e-14)
    }
  })

  it('reduces to an exponential distribution at beta=1', () => {
    assert.ok(Math.abs(weibullSurvival(6, 1, 3) - Math.exp(-2)) < 1e-14)
    assert.ok(Math.abs(weibullHazard(6, 1, 3) - 1 / 3) < 1e-14)
  })

  it('rejects hazard at zero instead of returning infinity or NaN', () => {
    assert.throws(() => weibullHazard(0, 0.7, 10), RangeError)
  })

  it('has decreasing, constant, and increasing hazard regimes', () => {
    assert.ok(weibullHazard(1, 0.6, 10) > weibullHazard(8, 0.6, 10))
    assert.equal(weibullHazard(1, 1, 10), weibullHazard(8, 1, 10))
    assert.ok(weibullHazard(1, 2.2, 10) < weibullHazard(8, 2.2, 10))
  })

  it('approaches certain cumulative failure at very large time', () => {
    assert.equal(weibullSurvival(1e9, 2, 10), 0)
    assert.equal(weibullCdf(1e9, 2, 10), 1)
  })

  it('rejects invalid parameters, times, and base draws', () => {
    for (const beta of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => weibullSurvival(1, beta, 10), RangeError)
    }
    for (const eta of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => weibullCdf(1, 1.5, eta), RangeError)
    }
    assert.throws(() => weibullSurvival(-0.01, 1.5, 10), RangeError)
    assert.throws(() => lifetimeFromExponential(0, 1.5, 10), RangeError)
  })
})

describe('deterministic simulation', () => {
  it('produces deterministic open-interval inverse-CDF base draws', () => {
    const a = sampleUnitExponentials(20, 42)
    assert.deepEqual(a, sampleUnitExponentials(20, 42))
    assert.notDeepEqual(a, sampleUnitExponentials(20, 43))
    assert.ok(a.every((draw) => draw > 0 && Number.isFinite(draw)))
    assert.ok(Math.abs(lifetimeFromExponential(-Math.log1p(-0.5), 2, 10) - 10 * Math.sqrt(Math.log(2))) < 1e-12)
  })

  it('does not resample when time or Weibull parameters change', () => {
    const initial = createComponents(100, 123, 1.5, 10)
    const before = initial.map(({ baseDraw }) => baseDraw)
    survivalCounts(initial, 4)
    survivalCounts(initial, 9)
    assert.deepEqual(initial.map(({ baseDraw }) => baseDraw), before)
    assert.deepEqual(transformComponents(initial, 2.2, 14).map(({ baseDraw }) => baseDraw), before)
  })

  it('preserves each component lifetime for identical seed and parameters', () => {
    const first = createComponents(144, 2025, 1.6, 12)
    const repeated = createComponents(144, 2025, 1.6, 12)
    assert.equal(first[73].id, repeated[73].id)
    assert.equal(first[73].lifetime, repeated[73].lifetime)
  })

  it('has a monotone nonincreasing empirical survival curve', () => {
    const data = buildChartData(createComponents(400, 77, 1.4, 9), 1.4, 9, 30)
    assert.ok(data.every((point, i) => i === 0 || point.empirical <= data[i - 1].empirical))
  })

  it('converges toward theoretical survival for a fixed large sample', () => {
    const beta = 1.8
    const eta = 12
    const time = 8
    const samples = createComponents(100_000, 2025, beta, eta)
    assert.ok(Math.abs(survivalCounts(samples, time).fraction - weibullSurvival(time, beta, eta)) < 0.005)
  })

  it('rejects invalid seeds and counts', () => {
    assert.throws(() => sampleUnitExponentials(0, 1), RangeError)
    assert.throws(() => sampleUnitExponentials(2.5, 1), RangeError)
    assert.throws(() => sampleUnitExponentials(10, 1.5), RangeError)
  })

  it('counts a component as failed at its exact lifetime', () => {
    const sample = createComponents(1, 9, 1.5, 10)
    assert.deepEqual(survivalCounts(sample, sample[0].lifetime), { surviving: 0, failed: 1, fraction: 0 })
    assert.throws(() => survivalCounts(sample, -1), RangeError)
  })

  it('validates chart domain and point count', () => {
    const sample = createComponents(4, 3, 1.5, 10)
    assert.throws(() => buildChartData(sample, 1.5, 10, 0), RangeError)
    assert.throws(() => buildChartData(sample, 1.5, 10, 10, 1), RangeError)
  })
})
