import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseSupportedLanguageString } from './parsing.ts'

describe('parseSupportedLanguageString function', function () {
  it('parses lowercase ISO 639-1 English (en)', function () {
    const lang = parseSupportedLanguageString('en')
    assert.equal(lang, 'en')
  })

  it('parses uppercase ISO 639-1 English (EN)', function () {
    const lang = parseSupportedLanguageString('EN')
    assert.equal(lang, 'en')
  })

  it('parses lowercase ISO 639-3 English (eng)', function () {
    const lang = parseSupportedLanguageString('eng')
    assert.equal(lang, 'en')
  })

  it('parses uppercase ISO 639-3 English (eng)', function () {
    const lang = parseSupportedLanguageString('eng')
    assert.equal(lang, 'en')
  })

  it('parses BCP-47 US English (en-US)', function () {
    const lang = parseSupportedLanguageString('en-US')
    assert.equal(lang, 'en')
  })

  it('parses uppercase BCP-47 US English (EN-US)', function () {
    const lang = parseSupportedLanguageString('EN-US')
    assert.equal(lang, 'en')
  })

  it('parses lowercase underscored BCP-47 US English (en_US)', function () {
    const lang = parseSupportedLanguageString('en_US')
    assert.equal(lang, 'en')
  })

  it('parses uppercase underscored BCP-47 US English (EN_US)', function () {
    const lang = parseSupportedLanguageString('EN_US')
    assert.equal(lang, 'en')
  })
})
