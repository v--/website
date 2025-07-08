import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parsePreferredLanguage } from './languages.ts'
import { assertUndefined } from '../../testing/assertion.ts'

describe('parsePreferredLanguage function', function () {
  it('does not identify a wildcard language', function () {
    const header = '*'
    const lang = parsePreferredLanguage(header)
    assertUndefined(lang)
  })

  it('correctly parses ISO 639-1 English (en)', function () {
    const header = 'en'
    const lang = parsePreferredLanguage(header)
    assert.equal(lang, 'en')
  })

  it('correctly parses BCP-47 US English', function () {
    const header = 'en-US'
    const lang = parsePreferredLanguage(header)
    assert.equal(lang, 'en')
  })

  it('correctly parses BCP-47 US English with unit weight', function () {
    const header = 'en-US; q=1'
    const lang = parsePreferredLanguage(header)
    assert.equal(lang, 'en')
  })

  it('correctly prefers higher-priority English', function () {
    const header = 'en; q=1, ru; q=0.6'
    const lang = parsePreferredLanguage(header)
    assert.equal(lang, 'en')
  })

  it('correctly prefers higher-priority Russian', function () {
    const header = 'en; q=0.6, ru; q=1'
    const lang = parsePreferredLanguage(header)
    assert.equal(lang, 'ru')
  })

  it('ignores highest-priority French', function () {
    const header = 'fr; q=1, ru; q=0.6'
    const lang = parsePreferredLanguage(header)
    assert.equal(lang, 'ru')
  })
})
