import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SubstitutionError } from './errors.ts'
import { substitutePlain } from './substitution.ts'

describe('substitutePlain function', function () {
  it('does nothing given an empty context', function () {
    const template = '${lorem}'
    const context = {}
    const expected = template

    assert.equal(substitutePlain(template, context), expected)
  })

  it('does nothing on an escaped key', function () {
    const template = '\\${lorem}'
    const context = { lorem: 'ipsum' }
    const expected = template

    assert.equal(substitutePlain(template, context), expected)
  })

  it('replaces a single value', function () {
    const template = '${lorem}'
    const context = { lorem: 'ipsum' }
    const expected = 'ipsum'

    assert.equal(substitutePlain(template, context), expected)
  })

  it('replaces a single value multiple times', function () {
    const template = '${lorem} ${lorem}'
    const context = { lorem: 'ipsum' }
    const expected = 'ipsum ipsum'

    assert.equal(substitutePlain(template, context), expected)
  })

  it('replaces multiple values', function () {
    const template = '${loremA} and ${loremB}'
    const context = { loremA: 'ipsumA', loremB: 'ipsumB' }
    const expected = 'ipsumA and ipsumB'

    assert.equal(substitutePlain(template, context), expected)
  })

  it('throws when given a non-compliant key', function () {
    const template = '$123'
    const context = { 123: 'test' }

    assert.throws(
      function () {
        substitutePlain(template, context)
      },
      SubstitutionError,
    )
  })
})
