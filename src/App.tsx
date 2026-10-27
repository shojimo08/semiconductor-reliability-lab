import { useEffect, useMemo, useRef, useState } from 'react'
import { ChipScene } from './components/ChipScene'
import { Controls } from './components/Controls'
import { ReliabilityChart } from './components/ReliabilityChart'
import { StatsPanel } from './components/StatsPanel'
import { ModelExplanation } from './components/ModelExplanation'
import { ReliabilityAnalysis } from './components/ReliabilityAnalysis'
import { LanguageSelector } from './components/LanguageSelector'
import { useI18n } from './i18n/useI18n'
import { weibullCdf, weibullHazard, weibullSurvival } from './math/weibull'
import { buildChartData, createComponents, survivalCounts, transformComponents } from './sim/components'

export default function App() {
  const { t } = useI18n()
  const [beta, setBeta] = useState(1.6)
  const [eta, setEta] = useState(12)
  const [count, setCount] = useState(144)
  const [seed, setSeed] = useState(2025)
  const [time, setTime] = useState(8)
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const lastFrame = useRef<number | null>(null)
  const maxTime = eta * 2.5
  const simulationTime = Math.min(time, maxTime)

  const baseSamples = useMemo(() => createComponents(count, seed, 1, 1), [count, seed])
  const samples = useMemo(() => transformComponents(baseSamples, beta, eta), [baseSamples, beta, eta])
  const counts = survivalCounts(samples, simulationTime)
  const reliability = weibullSurvival(simulationTime, beta, eta)
  const cdf = weibullCdf(simulationTime, beta, eta)
  const hazard = simulationTime === 0 ? null : weibullHazard(simulationTime, beta, eta)
  const chartData = useMemo(() => buildChartData(samples, beta, eta, maxTime), [samples, beta, eta, maxTime])
  useEffect(() => {
    if (!playing) { lastFrame.current = null; return }
    let frame: number
    const tick = (now: number) => {
      if (lastFrame.current === null) lastFrame.current = now
      const delta = Math.min((now - lastFrame.current) / 1000, 0.1)
      lastFrame.current = now
      setTime((current) => {
        const next = current + delta * Math.max(eta / 6, 0.5)
        if (next >= maxTime) { setPlaying(false); return maxTime }
        return next
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, eta, maxTime])

  return (
    <main>
      <header className="hero">
        <div><p className="kicker"><span /> {t('app.kicker')}</p><h1>{t('app.title.line1')}<br /><em>{t('app.title.line2')}</em></h1></div>
        <div className="hero-aside"><LanguageSelector /><p className="intro">{t('app.intro')}</p></div>
      </header>

      <StatsPanel reliability={reliability} cdf={cdf} empirical={counts.fraction} hazard={hazard} failed={counts.failed} surviving={counts.surviving} total={count} />

      <div className="workspace-grid">
        <Controls beta={beta} eta={eta} count={count} seed={seed} time={simulationTime} maxTime={maxTime} playing={playing}
          onBeta={setBeta} onEta={setEta} onCount={(value) => { setCount(value); setSelected(null) }} onSeed={setSeed} onTime={setTime} onPlaying={setPlaying}
          onResample={() => { setSeed((value) => value + 1); setSelected(null) }} />
        <ChipScene samples={samples} time={simulationTime} selected={selected} onSelect={setSelected} />
        <ReliabilityChart data={chartData} time={simulationTime} />
      </div>

      <ModelExplanation />
      <ReliabilityAnalysis beta={beta} eta={eta} currentTime={simulationTime} />

      <section className="assumptions" aria-labelledby="assumptions-heading">
        <p className="eyebrow">{t('assumptions.eyebrow')}</p><h2 id="assumptions-heading">{t('assumptions.title')}</h2>
        <div>
          <p><strong>{t('assumptions.modelsLabel')}</strong> {t('assumptions.models')}</p>
          <p><strong>{t('assumptions.notLabel')}</strong> {t('assumptions.not')}</p>
          <p><strong>{t('assumptions.hazardLabel')}</strong> {t('assumptions.hazard')}</p>
        </div>
      </section>

      <footer><span>{t('footer.model')}</span><span>R(t) = exp[−(t/η)<sup>β</sup>]</span></footer>
    </main>
  )
}
