import { useI18n } from '../i18n/useI18n'

interface ControlsProps {
  beta: number
  eta: number
  count: number
  seed: number
  time: number
  maxTime: number
  playing: boolean
  onBeta: (value: number) => void
  onEta: (value: number) => void
  onCount: (value: number) => void
  onSeed: (value: number) => void
  onTime: (value: number) => void
  onPlaying: (value: boolean) => void
  onResample: () => void
}

function Slider({ label, value, min, max, step, onChange, valueLabel }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (value: number) => void; valueLabel?: string
}) {
  const id = `control-${label.toLowerCase().replaceAll(' ', '-')}`
  return (
    <label className="control" htmlFor={id}>
      <span>{label}<output>{valueLabel ?? value}</output></span>
      <input id={id} type="range" value={value} min={min} max={max} step={step}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function Controls(props: ControlsProps) {
  const { t } = useI18n()
  const betaRegime = props.beta < 1 ? t('controls.betaLess') : props.beta === 1 ? t('controls.betaEqual') : t('controls.betaGreater')
  return (
    <section className="panel controls-panel" aria-labelledby="controls-heading">
      <div className="section-heading">
        <div><p className="eyebrow">{t('controls.eyebrow')}</p><h2 id="controls-heading">{t('controls.title')}</h2></div>
        <span className="status-dot"><i /> {t('controls.deterministic')}</span>
      </div>
      <Slider label={t('controls.shape')} value={props.beta} min={0.4} max={4} step={0.1} onChange={props.onBeta} valueLabel={props.beta.toFixed(1)} />
      <p className="regime-label">{betaRegime}</p>
      <Slider label={t('controls.scale')} value={props.eta} min={2} max={30} step={1} onChange={props.onEta} valueLabel={t('controls.units', { value: props.eta })} />
      <Slider label={t('controls.components')} value={props.count} min={64} max={400} step={16} onChange={props.onCount} />
      <label className="control" htmlFor="seed-input">
        <span>{t('controls.seed')} <output>{props.seed}</output></span>
        <input id="seed-input" className="number-input" type="number" value={props.seed} min={0} step={1}
          onChange={(event) => props.onSeed(Math.max(0, Math.trunc(Number(event.target.value))))} />
      </label>
      <Slider label={t('controls.time')} value={props.time} min={0} max={props.maxTime} step={0.05}
        onChange={props.onTime} valueLabel={t('controls.units', { value: props.time.toFixed(1) })} />
      <div className="button-row">
        <button className="primary" onClick={() => props.onPlaying(!props.playing)}>{props.playing ? t('controls.pause') : t('controls.play')}</button>
        <button onClick={() => { props.onPlaying(false); props.onTime(0) }}>{t('controls.reset')}</button>
        <button onClick={props.onResample}>{t('controls.resample')}</button>
      </div>
      <p className="control-note">{t('controls.note')}</p>
    </section>
  )
}
