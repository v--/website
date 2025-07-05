import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { dedent } from './dedent.ts'

describe('dedent function', function () {
  it('preserves an empty string', function () {
    const source = ''
    const processed = dedent(source)
    assert.equal(processed, source)
  })

  it('preserves a string without whitespace', function () {
    const source = 'lorem'
    const processed = dedent(source)
    assert.equal(processed, source)
  })

  it('clears an all-whitespace string', function () {
    const source = '    '
    const processed = dedent(source)
    assert.equal(processed, '')
  })

  it('removes the whitespace prefix from a single-line string', function () {
    const source = '    lorem'
    const processed = dedent(source)
    assert.equal(processed, 'lorem')
  })

  it('removes the whitespace prefix from a multi-line string', function () {
    const source = '    lorem\n    ipsum'
    const processed = dedent(source)
    assert.equal(processed, 'lorem\nipsum')
  })

  it('removes the minimal whitespace prefix from a variable-prefix multi-line string', function () {
    const source = '    lorem\n   ipsum\n  dolor'
    const processed = dedent(source)
    assert.equal(processed, '  lorem\n ipsum\ndolor')
  })

  it('disregards empty lines', function () {
    const source = '  lorem\n\n  ipsum'
    const processed = dedent(source)
    assert.equal(processed, 'lorem\n\nipsum')
  })

  it('disregards lines with only whitespaces', function () {
    const source = '  lorem\n \n  ipsum'
    const processed = dedent(source)
    assert.equal(processed, 'lorem\n\nipsum')
  })
})
