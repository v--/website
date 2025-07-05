import { dividedDifferences } from './divided_differences.ts'
import { type KnotMapping } from './knot_mapping.ts'
import { type float64 } from '../../types/numbers.ts'
import { UnivariatePolynomial, ZERO_POLYNOMIAL } from '../algebra/univariate_polynomial.ts'

export function constructNewtonUnivariatePolynomial(knots: KnotMapping): UnivariatePolynomial {
  const n = knots.getNodeCount()

  if (n === 0) {
    return ZERO_POLYNOMIAL
  }

  const x = Array.from(knots.iterX())

  function f(x: float64): float64 {
    // We only use this function at its knots
    return knots.getValue(x)!
  }

  let result = UnivariatePolynomial.safeCreate([f(x[0])])

  for (let k = 1; k < n; k++) {
    let current = UnivariatePolynomial.safeCreate(
      [dividedDifferences(f, x.slice(0, k + 1))],
    )

    for (let i = 0; i <= k - 1; i++) {
      current = current.mult(UnivariatePolynomial.safeCreate([-x[i], 1]))
    }

    result = result.add(current)
  }

  return result
}
