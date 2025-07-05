import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LanguageHeaderError, parseAcceptLanguageHeader } from './languages.ts'

describe('parseAcceptLanguageHeader function', function () {
  it('correctly parses wildcard', function () {
    const header = '*'
    const result = parseAcceptLanguageHeader(header)

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], { lang: '*' })
  })

  it('correctly parses english without variants', function () {
    const header = 'en'
    const result = parseAcceptLanguageHeader(header)

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], { lang: 'en' })
  })

  it('correctly parses english with US variant', function () {
    const header = 'en-US'
    const result = parseAcceptLanguageHeader(header)

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], { lang: 'en', variant: 'US' })
  })

  it('correctly parses english with US variant and unit weight', function () {
    const header = 'en-US; q=1'
    const result = parseAcceptLanguageHeader(header)

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], { lang: 'en', variant: 'US', weight: 1 })
  })

  it('correctly parses multiple languages with variants and weights', function () {
    const header = 'en-US; q=1, ru-RU; q=0.6'
    const result = parseAcceptLanguageHeader(header)

    assert.equal(result.length, 2)
    assert.deepEqual(result[0], { lang: 'en', variant: 'US', weight: 1 })
    assert.deepEqual(result[1], { lang: 'ru', variant: 'RU', weight: 0.6 })
  })

  it('fails to parse invalid string', function () {
    const header = 'en-US; q=1, ru-RU; q=0.'

    assert.throws(
      function () {
        parseAcceptLanguageHeader(header)
      },
      LanguageHeaderError,
    )
  })
})
