import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { format } from './format.ts'

describe('format function', function () {
  it('formats an empty string', function () {
    const template = ''
    const values = {}
    const result = format(template, values)
    const expected = template

    assert.equal(result, expected)
  })

  it('formats a string without fields', function () {
    const template = 'test'
    const values = {}
    const result = format(template, values)
    const expected = template

    assert.equal(result, expected)
  })

  it('formats a single field', function () {
    const template = '${field}'
    const values = { field: 'replacement' }
    const result = format(template, values)
    const expected = 'replacement'

    assert.equal(result, expected)
  })

  it('formats several fields', function () {
    const template = 'Both ${field1} and ${field2}'
    const values = { field1: 'apples', field2: 'oranges' }
    const result = format(template, values)
    const expected = 'Both apples and oranges'

    assert.equal(result, expected)
  })

  it('allows escaping standalone dollars', function () {
    const template = '\\$'
    const values = { field: 'replacement' }
    const result = format(template, values)
    const expected = '$'

    assert.equal(result, expected)
  })

  it('allows escaping dollars that would otherwise start valid specifiers', function () {
    const template = '\\${field}'
    const values = { field: 'replacement' }
    const result = format(template, values)
    const expected = '${field}'

    assert.equal(result, expected)
  })

  it('allows escaping backslashes', function () {
    const template = '\\\\'
    const values = {}
    const result = format(template, values)
    const expected = '\\'

    assert.equal(result, expected)
  })

  it('allows escaping standalone opening braces', function () {
    const template = '\\{'
    const values = {}
    const result = format(template, values)
    const expected = '{'

    assert.equal(result, expected)
  })

  it('allows escaping standalone closing braces', function () {
    const template = '\\}'
    const values = {}
    const result = format(template, values)
    const expected = '}'

    assert.equal(result, expected)
  })
})
