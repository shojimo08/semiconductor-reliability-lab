import { useI18n } from '../i18n/useI18n'

interface StatsPanelProps {
  reliability: number
  cdf: number
  empirical: number
  hazard: number | null
  failed: number
  surviving: number
  total: number
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`

export function StatsPanel(props: StatsPanelProps) {
  const { t } = useI18n()
  const stats = [
    [t('stats.theoryR'), percent(props.reliability), t('stats.survivalProbability')],
    [t('stats.observed'), percent(props.empirical), t('stats.surviveCount', { surviving: props.surviving, total: props.total })],
    [t('stats.theoryF'), percent(props.cdf), t('stats.cumulativeFailure')],
    [t('stats.hazard'), props.hazard === null ? '—' : props.hazard.toFixed(3), props.hazard === null ? t('stats.hazardUndefined') : t('stats.perUnit')],
  ]
  return (
    <section className="stats-grid" aria-label={t('stats.aria')}>
      {stats.map(([label, value, note]) => <article className="stat-card" key={label}>
        <p>{label}</p><strong>{value}</strong><small>{note}</small>
      </article>)}
      <article className="failure-bar-card">
        <div><span><i className="survive-key" /> {t('stats.surviving')} {props.surviving}</span><span><i className="fail-key" /> {t('stats.failed')} {props.failed}</span></div>
        <div className="failure-bar" aria-label={t('stats.barLabel', { failed: props.failed, surviving: props.surviving })}>
          <span style={{ width: `${props.empirical * 100}%` }} />
        </div>
      </article>
    </section>
  )
}
