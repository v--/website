import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseFormattingTemplate } from './parser.ts'
import { assertInstanceOf } from '../../testing/assertion.ts'
import { ParserError, TokenizerError } from '../parsing/errors.ts'
import { dedent } from '../support/dedent.ts'

describe('parseFormattingTemplate function', function () {
  describe('parses', function () {
    it('an empty string', function () {
      const template = ''
      const result = parseFormattingTemplate(template)
      const expected = { entries: [] }

      assert.deepEqual(result, expected)
    })

    it('a simple string without fields', function () {
      const template = 'test'
      const result = parseFormattingTemplate(template)
      const expected = {
        entries: ['test'],
      }

      assert.deepEqual(result, expected)
    })

    it('a single field', function () {
      const template = '${field_name}'
      const result = parseFormattingTemplate(template)
      const expected = {
        entries: [
          { field: 'field_name' },
        ],
      }

      assert.deepEqual(result, expected)
    })

    it('a single field with spaces in the name', function () {
      const template = '${field name}'
      const result = parseFormattingTemplate(template)
      const expected = {
        entries: [
          { field: 'field name' },
        ],
      }

      assert.deepEqual(result, expected)
    })

    it('a single field with an escaped dollar in the name', function () {
      const template = '${\\$}'
      const result = parseFormattingTemplate(template)
      const expected = {
        entries: [
          { field: '$' },
        ],
      }

      assert.deepEqual(result, expected)
    })

    it('a single field with an escaped closing brace in the name', function () {
      const template = '${\\}}'
      const result = parseFormattingTemplate(template)
      const expected = {
        entries: [
          { field: '}' },
        ],
      }

      assert.deepEqual(result, expected)
    })

    it('a more complex format template', function () {
      const template = 'Both ${field_1} and ${field_2}'
      const result = parseFormattingTemplate(template)
      const expected = {
        entries: [
          'Both ',
          { field: 'field_1' },
          ' and ',
          { field: 'field_2' },
        ],
      }

      assert.deepEqual(result, expected)
    })
  })

  describe('disallows', function () {
    it('disallows standalone dollars', function () {
      const template = '$'

      assert.throws(
        function () {
          parseFormattingTemplate(template)
        },
        function (err: ParserError) {
          assertInstanceOf(err, ParserError)
          assert.equal(err.message, 'Field specifier must start with ${')
          assert.equal(
            err.cause,
            dedent(`\
              1 │ $
                │ ^
              `),
          )
          return true
        },
      )
    })

    it('disallows unrecognized escape sequences', function () {
      const template = '\\a'

      assert.throws(
        function () {
          parseFormattingTemplate(template)
        },
        function (err: TokenizerError) {
          assertInstanceOf(err, TokenizerError)
          assert.equal(err.message, 'Unrecognized escape sequence')
          assert.equal(
            err.cause,
            dedent(`\
              1 │ \\a
                │ ^^
              `),
          )
          return true
        },
      )
    })

    it('symbols between a dollar and opening brace', function () {
      const template = '$m{field}'

      assert.throws(
        function () {
          parseFormattingTemplate(template)
        },
        function (err: ParserError) {
          assertInstanceOf(err, ParserError)
          assert.equal(err.message, 'Field specifier must start with ${')
          assert.equal(
            err.cause,
            dedent(`\
              1 │ $m{field}
                │ ^^
              `),
          )
          return true
        },
      )
    })

    it('field specifiers without names', async function () {
      const template = '${}'

      assert.throws(
        function () {
          parseFormattingTemplate(template)
        },
        function (err: ParserError) {
          assertInstanceOf(err, ParserError)
          assert.equal(err.message, 'Empty field specifier')
          assert.equal(
            err.cause,
            dedent(`\
              1 │ \${}
                │ ^^^
              `),
          )
          return true
        },
      )
    })

    it('disallows unclosed format specifiers', function () {
      const template = '${field'

      assert.throws(
        function () {
          parseFormattingTemplate(template)
        },
        function (err: ParserError) {
          assertInstanceOf(err, ParserError)
          assert.equal(err.message, 'Field specifier ended abruptly')
          assert.equal(
            err.cause,
            dedent(`\
              1 │ \${field
                │ ^^^^^^^
              `),
          )
          return true
        },
      )
    })
  })
})
