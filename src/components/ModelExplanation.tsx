import { useI18n } from '../i18n/useI18n'

export function ModelExplanation() {
  const { t } = useI18n()
  return (
    <section className="model-explanation" aria-labelledby="model-heading">
      <div className="explanation-intro">
        <p className="eyebrow">{t('model.eyebrow')}</p>
        <h2 id="model-heading">{t('model.why')}</h2>
        <p>{t('model.whyText')}</p>
      </div>
      <div className="equation-card" aria-label={t('model.equationsAria')}>
        <span>{t('model.distribution')}</span>
        <code>F(t) = 1 − exp[−(t/η)<sup>β</sup>]</code>
        <code>R(t) = exp[−(t/η)<sup>β</sup>]</code>
        <code>h(t) = (β/η)(t/η)<sup>β−1</sup>, t &gt; 0</code>
      </div>
      <div className="shape-card">
        <span className="shape-beta">β &lt; 1</span><strong>{t('model.decreasing')}</strong><p>{t('model.decreasingText')}</p>
        <span className="shape-beta">β = 1</span><strong>{t('model.constant')}</strong><p>{t('model.constantText')}</p>
        <span className="shape-beta">β &gt; 1</span><strong>{t('model.increasing')}</strong><p>{t('model.increasingText')}</p>
      </div>
      <div className="application-card">
        <span>{t('model.uses')}</span>
        <p>{t('model.usesText')}</p>
        <p className="application-caveat">{t('model.caveat')}</p>
      </div>
    </section>
  )
}
