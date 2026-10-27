import type { ChartPoint } from '../sim/components'
import { useI18n } from '../i18n/useI18n'

const W = 700
const H = 300
const P = { left: 58, right: 18, top: 14, bottom: 42 }

export function ReliabilityChart({ data, time }: { data: ChartPoint[]; time: number }) {
  const { t } = useI18n()
  const maxTime = data.at(-1)?.time ?? 1
  const x = (value: number) => P.left + (value / maxTime) * (W - P.left - P.right)
  const y = (value: number) => P.top + (1 - value) * (H - P.top - P.bottom)
  const theoryPath = data.map((point, i) => `${i ? 'L' : 'M'} ${x(point.time)} ${y(point.theoretical)}`).join(' ')
  const empiricalPath = data.map((point, i) => i ? `H ${x(point.time)} V ${y(point.empirical)}` : `M ${x(point.time)} ${y(point.empirical)}`).join(' ')
  const current = data.reduce((nearest, point) => Math.abs(point.time - time) < Math.abs(nearest.time - time) ? point : nearest, data[0])
  return (
    <section className="panel chart-panel" aria-labelledby="chart-heading">
      <div className="section-heading">
        <div><p className="eyebrow">{t('chart.eyebrow')}</p><h2 id="chart-heading">{t('chart.title')}</h2></div>
        <div className="legend" aria-hidden="true"><span className="theory-key">{t('chart.theory')}</span><span className="empirical-key">{t('chart.empirical')}</span></div>
      </div>
      <div className="chart-wrap" role="img" aria-label={t('chart.aria')}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {[0, .25, .5, .75, 1].map((tick) => <g key={tick}>
            <line x1={P.left} x2={W-P.right} y1={y(tick)} y2={y(tick)} className="grid-line" />
            <text x={P.left-10} y={y(tick)+4} textAnchor="end">{tick*100}%</text>
          </g>)}
          {[0, .25, .5, .75, 1].map((tick) => <text key={tick} x={x(maxTime*tick)} y={H-20} textAnchor="middle">{(maxTime*tick).toFixed(0)}</text>)}
          <line x1={x(time)} x2={x(time)} y1={P.top} y2={H-P.bottom} className="time-line" />
          <path d={theoryPath} className="theory-line" />
          <path d={empiricalPath} className="empirical-line" />
          <circle cx={x(time)} cy={y(current.theoretical)} r="5" className="theory-marker" />
          <circle cx={x(time)} cy={y(current.empirical)} r="5" className="empirical-marker" />
          <text className="axis-title-y" x="14" y={(P.top+H-P.bottom)/2} textAnchor="middle" transform={`rotate(-90 14 ${(P.top+H-P.bottom)/2})`}>{t('chart.yAxis')}</text>
          <text x={(P.left+W-P.right)/2} y={H-3} textAnchor="middle">{t('chart.xAxis')}</text>
        </svg>
      </div>
      <p className="chart-note">{t('chart.note')}</p>
    </section>
  )
}
