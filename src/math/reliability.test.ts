import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sampleUnitExponentials } from './random.ts'
import { weibullHazard, weibullSurvival } from './weibull.ts'
import {
  conditionalFailureProbability,
  exponentialReliability,
  gompertzCumulativeHazard,
  gompertzReliability,
  weibullCumulativeHazard,
  weibullPdf,
} from './reliability.ts'

describe('reliability identities', () => {
  it('satisfies hazard = PDF / survival', () => {
    for (const t of [0.1, 2, 8, 20]) {
      const survival = weibullSurvival(t, 1.7, 12)
      assert.ok(Math.abs(weibullPdf(t, 1.7, 12) / survival - weibullHazard(t, 1.7, 12)) < 1e-13)
    }
  })

  it('satisfies R(t) = exp(-H(t))', () => {
    for (const t of [0, 1, 7, 30]) {
      assert.ok(Math.abs(weibullSurvival(t, 2.1, 9) - Math.exp(-weibullCumulativeHazard(t, 2.1, 9))) < 1e-14)
    }
  })

  it('reduces Weibull beta=1 to exponential reliability', () => {
    for (const t of [0, 2, 12, 40]) {
      assert.ok(Math.abs(weibullSurvival(t, 1, 12) - exponentialReliability(t, 1 / 12)) < 1e-14)
    }
  })

  it('implements Gompertz reliability from cumulative hazard', () => {
    const H = gompertzCumulativeHazard(7, 0.03, 0.08)
    assert.ok(Math.abs(gompertzReliability(7, 0.03, 0.08) - Math.exp(-H)) < 1e-14)
  })
})

describe('conditional failure probability', () => {
  it('equals 1 - R(t+delta)/R(t)', () => {
    const age = 8
    const delta = 3
    const expected = 1 - weibullSurvival(age + delta, 1.8, 12) / weibullSurvival(age, 1.8, 12)
    assert.ok(Math.abs(conditionalFailureProbability(age, delta, 1.8, 12) - expected) < 1e-14)
  })

  it('is zero for a zero future interval and memoryless for beta=1', () => {
    assert.equal(conditionalFailureProbability(9, 0, 1.8, 12), 0)
    const fresh = conditionalFailureProbability(0, 4, 1, 12)
    assert.ok(Math.abs(conditionalFailureProbability(18, 4, 1, 12) - fresh) < 1e-14)
  })

  it('shows age dependence on either side of beta=1', () => {
    assert.ok(conditionalFailureProbability(12, 3, 2, 10) > conditionalFailureProbability(0, 3, 2, 10))
    assert.ok(conditionalFailureProbability(12, 3, 0.7, 10) < conditionalFailureProbability(0, 3, 0.7, 10))
  })

  it('preserves Monte Carlo base draws across repeated seeded calls', () => {
    assert.deepEqual(sampleUnitExponentials(1_000, 8080), sampleUnitExponentials(1_000, 8080))
  })

  it('returns bounded finite results for extreme valid inputs', () => {
    for (const result of [
      conditionalFailureProbability(1e250, 1e249, 4, 1e-100),
      conditionalFailureProbability(1e-250, 1e-251, 0.4, 1e100),
      conditionalFailureProbability(0, 1e200, 8, 1e-200),
    ]) {
      assert.ok(Number.isFinite(result))
      assert.ok(result >= 0 && result <= 1)
    }
  })

  it('rejects invalid conditional-analysis ranges', () => {
    assert.throws(() => conditionalFailureProbability(-1, 2, 1.5, 10), RangeError)
    assert.throws(() => conditionalFailureProbability(1, -2, 1.5, 10), RangeError)
    assert.throws(() => conditionalFailureProbability(1, 2, 0, 10), RangeError)
    assert.throws(() => conditionalFailureProbability(1, 2, 1.5, 0), RangeError)
  })
})
