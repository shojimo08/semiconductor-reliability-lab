import { useMemo, useState } from 'react'
import { buildModelComparison, conditionalFailureProbability, type ModelComparisonPoint } from '../math/reliability'
import { useI18n } from '../i18n/useI18n'

const W = 620
const H = 230
const P = { left: 48, right: 14, top: 16, bottom: 34 }

function ComparisonChart({ data, kind }: { data: ModelComparisonPoint[]; kind: 'reliability' | 'hazard' }) {
  const { t } = useI18n()
  const maxTime = data.at(-1)?.time ?? 1
  const hazardValues = data.flatMap((point) => [point.exponentialHazard, point.gompertzHazard, point.weibullHazard ?? 0])
  const maxY = kind === 'reliability' ? 1 : Math.max(...hazardValues) * 1.08
  const x = (value: number) => P.left + value / maxTime * (W - P.left - P.right)
  const y = (value: number) => P.top + (1 - value / maxY) * (H - P.top - P.bottom)
  const fields = kind === 'reliability'
    ? ['exponentialReliability', 'weibullReliability', 'gompertzReliability'] as const
    : ['exponentialHazard', 'weibullHazard', 'gompertzHazard'] as const
  const makePath = (field: typeof fields[number]) => {
    let started = false
    return data.flatMap((point) => {
      const value = point[field]
      if (value === null) return []
      const command = started ? 'L' : 'M'
      started = true
      return [`${command} ${x(point.time)} ${y(value)}`]
    }).join(' ')
  }
  const kindLabel = kind === 'reliability' ? t('comparison.reliability') : t('comparison.hazard')
  return <div className="comparison-chart" role="img" aria-label={t('comparison.chartAria', { kind: kindLabel })}>
    <h4>{kindLabel}</h4>
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {[0, .5, 1].map((tick) => <g key={tick}>
        <line x1={P.left} x2={W-P.right} y1={y(maxY*tick)} y2={y(maxY*tick)} />
        <text x={P.left-8} y={y(maxY*tick)+4} textAnchor="end">{(maxY*tick).toFixed(kind === 'reliability' ? 1 : 2)}</text>
      </g>)}
      {[0, .5, 1].map((tick) => <text key={tick} x={x(maxTime*tick)} y={H-12} textAnchor="middle">{(maxTime*tick).toFixed(0)}</text>)}
      {fields.map((field, index) => <path key={field} d={makePath(field)} className={`model-line model-line-${index}`} />)}
      <text x={(P.left+W-P.right)/2} y={H-1} textAnchor="middle">{t('comparison.axis')}</text>
    </svg>
  </div>
}

export function ReliabilityAnalysis({ beta, eta, currentTime }: { beta: number; eta: number; currentTime: number }) {
  const { t } = useI18n()
  const [age, setAge] = useState(currentTime)
  const [delta, setDelta] = useState(3)
  const boundedAge = Math.min(age, eta * 2)
  const olderRisk = conditionalFailureProbability(boundedAge, delta, beta, eta)
  const newRisk = conditionalFailureProbability(0, delta, beta, eta)
  const comparison = useMemo(() => buildModelComparison(beta, eta, eta * 2.5), [beta, eta])
  const relation = Math.abs(olderRisk - newRisk) < 1e-12 ? t('conditional.equal') : olderRisk > newRisk ? t('conditional.higher') : t('conditional.lower')

  return <section className="analysis-module" aria-labelledby="analysis-heading">
    <div className="analysis-header">
      <div><p className="eyebrow">{t('analysis.eyebrow')}</p><h2 id="analysis-heading">{t('analysis.title')}</h2></div>
      <p>{t('analysis.intro')}</p>
    </div>

    <div className="foundations-grid">
      <article className="foundation-derivation">
        <p className="eyebrow">{t('analysis.foundations')}</p>
        <h3>{t('analysis.whyFalls')}</h3>
        <div className="derivation-steps">
          <code>f(t) = F′(t)</code><span>{t('analysis.pdfShort')}</span>
          <code>R(t) = 1 − F(t)</code><span>{t('analysis.survivalShort')}</span>
          <code>h(t) = f(t) / R(t)</code><span>{t('analysis.rateShort')}</span>
          <code>R′(t) = −f(t) = −h(t)R(t)</code><span>{t('analysis.odeShort')}</span>
          <code>H(t) = ∫₀ᵗ h(u)du</code><span>{t('analysis.cumulativeShort')}</span>
          <code>R(t) = exp[−H(t)]</code><span>{t('analysis.solutionShort')}</span>
        </div>
      </article>
      <article className="definitions-card">
        <p className="eyebrow">{t('analysis.quantities')}</p>
        <dl>
          <div><dt>PDF · f(t)</dt><dd>{t('analysis.pdf')}</dd></div>
          <div><dt>CDF · F(t)</dt><dd>{t('analysis.cdf')}</dd></div>
          <div><dt>R(t)</dt><dd>{t('analysis.survival')}</dd></div>
          <div><dt>h(t)</dt><dd>{t('analysis.hazard')}</dd></div>
        </dl>
      </article>
    </div>

    <div className="conditional-card">
      <div className="conditional-copy">
        <p className="eyebrow">{t('conditional.eyebrow')}</p>
        <h3>{t('conditional.title')}</h3>
        <code>P(t₀&lt;T≤t₀+Δ | T&gt;t₀) = 1 − R(t₀+Δ)/R(t₀)</code>
        <code className="stable-equation">= 1 − exp&#123;−[((t₀+Δ)/η)<sup>β</sup> − (t₀/η)<sup>β</sup>]&#125;</code>
        <p>{t('conditional.explanation')}</p>
      </div>
      <div className="conditional-controls">
        <label>{t('conditional.age')} <output>{boundedAge.toFixed(1)}</output><input type="range" min="0" max={eta*2} step="0.1" value={boundedAge} onChange={(event) => setAge(Number(event.target.value))} /></label>
        <label>{t('conditional.delta')} <output>{delta.toFixed(1)}</output><input type="range" min="0" max={eta} step="0.1" value={delta} onChange={(event) => setDelta(Number(event.target.value))} /></label>
      </div>
      <div className="conditional-results">
        <div><span>{t('conditional.new')}</span><strong>{(newRisk*100).toFixed(2)}%</strong><small>{t('conditional.newNote')}</small></div>
        <div><span>{t('conditional.older')}</span><strong>{(olderRisk*100).toFixed(2)}%</strong><small>{t('conditional.olderNote')}</small></div>
        <p>{t('conditional.comparison', { beta: beta.toFixed(1), relation })}</p>
      </div>
    </div>

    <div className="comparison-card">
      <div className="comparison-heading">
        <div><p className="eyebrow">{t('comparison.eyebrow')}</p><h3>{t('comparison.title')}</h3></div>
        <div className="model-legend"><span>{t('comparison.exponential')}</span><span>{t('comparison.weibull')}</span><span>{t('comparison.gompertz')}</span></div>
      </div>
      <div className="comparison-charts"><ComparisonChart data={comparison} kind="reliability" /><ComparisonChart data={comparison} kind="hazard" /></div>
      <div className="model-assumptions">
        <p><strong>{t('comparison.exponential')}</strong> {t('comparison.expAssumption')}</p>
        <p><strong>{t('comparison.weibull')}</strong> {t('comparison.weibullAssumption')}</p>
        <p><strong>{t('comparison.gompertz')}</strong> {t('comparison.gompertzAssumption')}</p>
      </div>
      <p className="comparison-caveat">{t('comparison.caveat')}</p>
    </div>
  </section>
}
