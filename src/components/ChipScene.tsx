import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { ComponentSample } from '../sim/components'
import { useI18n } from '../i18n/useI18n'

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn('3D view unavailable', error, info) }
  render() { return this.state.failed ? <CanvasFallback /> : this.props.children }
}

function CanvasFallback() {
  const { t } = useI18n()
  return <div className="canvas-fallback">{t('chip.graphicsUnavailable')}</div>
}

function Chip({ samples, time, selected, onSelect }: { samples: ComponentSample[]; time: number; selected: number | null; onSelect: (id: number | null) => void }) {
  const columns = Math.ceil(Math.sqrt(samples.length))
  const rows = Math.ceil(samples.length / columns)
  const spacing = 0.54
  return <group rotation={[0, 0, 0]}>
    <mesh position={[0, -0.39, 0]} receiveShadow>
      <boxGeometry args={[columns * spacing + 1.7, 0.18, rows * spacing + 1.7]} />
      <meshStandardMaterial color="#071018" metalness={0.84} roughness={0.25} />
    </mesh>
    <mesh position={[0, -0.22, 0]} receiveShadow>
      <boxGeometry args={[columns * spacing + 1, 0.35, rows * spacing + 1]} />
      <meshStandardMaterial color="#12283a" metalness={0.72} roughness={0.3} />
    </mesh>
    {Array.from({ length: Math.min(columns, 12) }, (_, index) => {
      const padX = (index - (Math.min(columns, 12) - 1) / 2) * 0.58
      const padZ = rows * spacing / 2 + 0.62
      return <group key={`pads-${index}`}>
        <mesh position={[padX, -0.25, padZ]}><cylinderGeometry args={[0.11, 0.11, 0.06, 12]} /><meshStandardMaterial color="#b68c45" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[padX, -0.25, -padZ]}><cylinderGeometry args={[0.11, 0.11, 0.06, 12]} /><meshStandardMaterial color="#b68c45" metalness={0.9} roughness={0.25} /></mesh>
      </group>
    })}
    {samples.map((sample) => {
      const x = (sample.column - (columns - 1) / 2) * spacing
      const z = (sample.row - (rows - 1) / 2) * spacing
      const failed = sample.lifetime <= time
      const isSelected = selected === sample.id
      return <group key={sample.id} position={[x, isSelected ? 0.15 : 0.06, z]}>
        <mesh castShadow
          onClick={(event) => { event.stopPropagation(); onSelect(sample.id) }}
          onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = 'default' }}>
          <boxGeometry args={[0.42, isSelected ? 0.25 : 0.16, 0.42]} />
          <meshStandardMaterial color={failed ? '#ff6b4a' : '#10b8cf'} emissive={failed ? '#7b1e12' : '#07505e'} emissiveIntensity={isSelected ? 0.9 : 0.48} roughness={0.32} metalness={0.38} />
        </mesh>
        {isSelected && <mesh>
          <boxGeometry args={[0.49, 0.32, 0.49]} />
          <meshBasicMaterial color="#fff1a8" wireframe transparent opacity={0.95} />
        </mesh>}
      </group>
    })}
  </group>
}

export function ChipScene({ samples, time, selected, onSelect }: { samples: ComponentSample[]; time: number; selected: number | null; onSelect: (id: number | null) => void }) {
  const { t } = useI18n()
  const side = Math.ceil(Math.sqrt(samples.length))
  const selectedSample = selected === null ? null : samples[selected] ?? null
  const failed = samples.filter((sample) => sample.lifetime <= time).length
  return (
    <section className="panel chip-panel" aria-labelledby="chip-heading">
      <div className="section-heading"><div><p className="eyebrow">{t('chip.eyebrow')}</p><h2 id="chip-heading">{t('chip.title')}</h2></div><span className="orbit-hint">{t('chip.orbit')}</span></div>
      <div className="canvas-wrap">
        <div className="scene-legend" aria-label={t('chip.legendLabel', { surviving: samples.length - failed, failed })}>
          <span><i className="survive-key" /> {t('stats.surviving')} <b>{samples.length - failed}</b></span>
          <span><i className="fail-key" /> {t('stats.failed')} <b>{failed}</b></span>
        </div>
        <div className="package-label">{t('chip.package')}</div>
        <CanvasBoundary>
          <Canvas camera={{ position: [side * 0.48, side * 0.55, side * 0.6], fov: 38 }} shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
            <color attach="background" args={['#334957']} />
            <ambientLight intensity={1.65} />
            <directionalLight position={[7, 10, 6]} intensity={3.2} castShadow />
            <directionalLight position={[-6, 5, -4]} color="#b8d8e6" intensity={1.1} />
            <pointLight position={[-8, 4, -5]} color="#8eeeff" intensity={22} />
            <Chip samples={samples} time={time} selected={selected} onSelect={onSelect} />
            <ContactShadows position={[0, -0.43, 0]} opacity={0.45} scale={20} blur={2.6} far={10} />
            <OrbitControls makeDefault enablePan={false} minDistance={8} maxDistance={25} maxPolarAngle={Math.PI / 2.15} />
          </Canvas>
        </CanvasBoundary>
        {selectedSample && <div className="component-inspector" aria-live="polite">
          <div><span>{t('chip.componentId')}</span><strong>C-{String(selectedSample.id + 1).padStart(3, '0')}</strong></div>
          <div><span>{t('chip.sampledTime')}</span><strong>{t('controls.units', { value: selectedSample.lifetime.toFixed(2) })}</strong></div>
          <div><span>{t('chip.simulationTime')}</span><strong>{t('controls.units', { value: time.toFixed(2) })}</strong></div>
          <div><span>{t('chip.currentStatus')}</span><strong className={selectedSample.lifetime > time ? 'is-surviving' : 'is-failed'}>{selectedSample.lifetime > time ? t('stats.surviving') : t('stats.failed')}</strong></div>
          <button aria-label={t('chip.close')} onClick={() => onSelect(null)}>×</button>
          <p>{t('chip.inspectorNote')}</p>
        </div>}
      </div>
      <p className="chip-note">{t('chip.note')}</p>
    </section>
  )
}
