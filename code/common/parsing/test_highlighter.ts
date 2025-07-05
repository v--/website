/**
 * Port of https://github.com/v--/notebook/blob/master/code/notebook/parsing/test_highlighter.py
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ErrorHighlighter } from './highlighter.ts'
import { dedent } from '../support/dedent.ts'

describe('ErrorHighlighter class', function () {
  describe('highlight method', function () {
    it('highlights a basic error', function () {
      const highlighter = new ErrorHighlighter({
        source: 'test',
        offsetHiStart: 1,
        offsetHiEnd: 1,
      })

      const expected = dedent(`\
        1 │ test
          │  ^
        `,
      )

      assert.equal(highlighter.highlight(), expected)
    })

    it('highlights an error at the end of the string', function () {
      const highlighter = new ErrorHighlighter({
        source: 'test\n',
        offsetHiStart: 4,
        offsetHiEnd: 4,
      })

      const expected = dedent(`\
        1 │ test↵
          │     ^
        `,
      )

      assert.equal(highlighter.highlight(), expected)
    })

    it('highlights an error on a single-line excerpt of a multiline string', function () {
      const highlighter = new ErrorHighlighter({
        source: 'test1\ntest2\ntest3',
        offsetHiStart: 7,
        offsetHiEnd: 7,
      })

      const expected = dedent(`\
        2 │ test2↵
          │  ^
        `,
      )

      assert.equal(highlighter.highlight(), expected)
    })

    it('highlights an error on a multiline excerpt multiline string', function () {
      const highlighter = new ErrorHighlighter({
        source: 'test1\ntest2\ntest3',
        offsetHiStart: 7,
        offsetHiEnd: 15,
      })

      const expected = dedent(`\
        2 │ test2↵
          │  ^^^^^
        3 │ test3
          │ ^^^^
        `,
      )

      assert.equal(highlighter.highlight(), expected)
    })

    it('highlights an error on a multiline string with a high visibility setting', function () {
      const highlighter = new ErrorHighlighter({
        source: 'test1\ntest2\ntest3\ntest4\ntest5',
        offsetHiStart: 7,
        offsetHiEnd: 15,
        offsetShownStart: 0,
        offsetShownEnd: 25,
      })

      const expected = dedent(`\
        1 │ test1↵
        2 │ test2↵
          │  ^^^^^
        3 │ test3↵
          │ ^^^^
        4 │ test4↵
        5 │ test5
        `,
      )

      assert.equal(highlighter.highlight(), expected)
    })
  })
})
