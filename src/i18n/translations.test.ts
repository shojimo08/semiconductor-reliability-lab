import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createComponents } from '../sim/components.ts'
import { dictionaries, en, resolveLanguage, translate } from './translations.ts'

describe('translations', () => {
  it('has complete and identical translation keys in every language', () => {
    const expected = Object.keys(en).sort()
    for (const dictionary of Object.values(dictionaries)) assert.deepEqual(Object.keys(dictionary).sort(), expected)
  })

  it('defaults unsupported or absent language values to English', () => {
    assert.equal(resolveLanguage(null), 'en')
    assert.equal(resolveLanguage('fr'), 'en')
    assert.equal(translate('en', 'missing.key'), 'missing.key')
  })

  it('interpolates values without altering mathematical notation', () => {
    assert.equal(translate('zh-TW', 'controls.units', { value: 12 }), '12 單位')
    assert.match(translate('ja', 'chip.sampledTime'), /Tᵢ/)
    assert.match(translate('en', 'stats.hazard'), /h\(t\)/)
  })

  it('language lookup leaves seeded simulation and selection state unchanged', () => {
    const samples = createComponents(144, 2025, 1.6, 12)
    const selectedId = 73
    const lifetime = samples[selectedId].lifetime
    for (const language of ['en', 'zh-TW', 'ja'] as const) translate(language, 'chip.currentStatus')
    assert.equal(samples[selectedId].id, selectedId)
    assert.equal(samples[selectedId].lifetime, lifetime)
  })
})
