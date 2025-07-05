import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { mathml } from './mathml.ts'
import { IntegrityError } from '../errors.ts'
import { convertRichToPlain } from './conversion.ts'
import { type float64 } from '../types/numbers.ts'

describe('MathMLHelper class', function () {
  describe('linearCombination method', function () {
    function linearCombination(coeff: float64[], values: Array<string | undefined>): string {
      const entry = mathml.linearCombination(
        coeff,
        values.map(name => name === undefined ? undefined : mathml.identifier(name)),
      )

      const result = convertRichToPlain({
        kind: 'document',
        entries: [mathml.root('inline', entry)],
      })

      return result.slice(1, result.length - 1) // Remove dollar signs
    }

    it('returns zero when no data is passed', function () {
      assert.equal(
        linearCombination([], []),
        '0',
      )
    })

    it('throws on coefficient and value dimension mismatch', function () {
      assert.throws(
        function () {
          linearCombination([], ['1'])
        },
        IntegrityError,
      )
    })

    it('displays a zero when it is the only coefficient', function () {
      assert.equal(
        linearCombination([0], ['x']),
        '0',
      )
    })

    it("doesn't display a zero when there are other entries", function () {
      assert.equal(
        linearCombination([0, 1], ['x', 'y']),
        'y',
      )
    })

    it("doesn't display a unit coefficient", function () {
      assert.equal(
        linearCombination([1], ['x']),
        'x',
      )
    })

    it("doesn't display a negative unit coefficient", function () {
      assert.equal(
        linearCombination([-1], ['x']),
        '-x',
      )
    })

    it('handles linear polynomials', function () {
      assert.equal(
        linearCombination([42], ['x']),
        '42x',
      )
    })

    it('puts parentheses around very small numbers when in front of an identifier', function () {
      assert.equal(
        linearCombination([0.0000042], ['x']),
        '(4e-6)x',
      )
    })

    it('skips parentheses around very small numbers when not in front of an identifier', function () {
      assert.equal(
        linearCombination([1, 0.0000042], ['x', undefined]),
        'x + 4e-6',
      )
    })

    it('handles linear polynomials with negative coefficients', function () {
      assert.equal(
        linearCombination([-42], ['x']),
        '-42x',
      )
    })

    it('handles linear polynomials with non-unit free coefficients', function () {
      assert.equal(
        linearCombination([1, 2], ['x', undefined]),
        'x + 2',
      )
    })

    it('handles linear polynomials with a unit free coefficients', function () {
      assert.equal(
        linearCombination([1, 1], ['x', undefined]),
        'x + 1',
      )
    })

    it('handles bivariate polynomials', function () {
      assert.equal(
        linearCombination([3, 2, 1], ['x', 'y', 'z']),
        '3x + 2y + z',
      )
    })

    it('handles bivariate polynomials with varying signs', function () {
      assert.equal(
        linearCombination([-3, 2, -1], ['x', 'y', 'z']),
        '-3x + 2y - z',
      )
    })
  })

  describe('functionApplication method', function () {
    function functionApplication(name: string, ...argLists: string[][]): string {
      const entry = mathml.functionApplication(
        mathml.identifier(name),
        ...argLists.map(args => args.map(a => mathml.identifier(a))),
      )

      const result = convertRichToPlain({
        kind: 'document',
        entries: [mathml.root('inline', entry)],
      })

      return result.slice(1, result.length - 1) // Remove dollar signs
    }

    it('parenthesizes a single argument', function () {
      assert.equal(
        functionApplication('f', ['x']),
        'f(x)',
      )
    })

    it('parenthesizes three argument', function () {
      assert.equal(
        functionApplication('f', ['x', 'y', 'z']),
        'f(x, y, z)',
      )
    })

    it('does not parenthesize zero arguments', function () {
      assert.equal(
        functionApplication('f', []),
        'f',
      )
    })

    it('allows two sets of arguments', function () {
      assert.equal(
        functionApplication('f', ['x'], ['y']),
        'f(x; y)',
      )
    })
  })
})
