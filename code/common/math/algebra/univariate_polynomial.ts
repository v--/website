import { UnivariatePolynomialError, ZeroUnivariatePolynomialError } from './errors.ts'
import { mathml } from '../../rich.ts'
import { DEFAULT_TOLERANCE, isClose, isZero } from '../../support/floating.ts'
import { all, chain, map, range, repeat, zip, zipLongest } from '../../support/iteration.ts'
import { type float64, type uint32 } from '../../types/numbers.ts'
import { type ISymbolicFunction } from '../numeric/types.ts'

interface IUnivariatePolynomialConfig {
  coeff: float64[]
}

export class UnivariatePolynomial implements IUnivariatePolynomialConfig, ISymbolicFunction<float64> {
  readonly coeff: float64[]

  static getMonomial(order: uint32) {
    return new UnivariatePolynomial({
      coeff: Array.from(
        chain(
          repeat(0, order),
          [1],
        ),
      ),
    })
  }

  /**
   * Trim any trailing coefficients and create a polynomial
   */
  static safeCreate(coeff: Iterable<float64>) {
    return new UnivariatePolynomial({
      coeff: trimTrailingZeros(Array.from(coeff)),
    })
  }

  constructor({ coeff }: IUnivariatePolynomialConfig) {
    if (coeff.length > 0 && isZero(coeff[coeff.length - 1])) {
      throw new UnivariatePolynomialError('The leading coefficient cannot be zero')
    }

    this.coeff = coeff
  }

  add(other: UnivariatePolynomial): UnivariatePolynomial {
    const aOrder = this.getDegree()
    const bOrder = other.getDegree()

    if (aOrder === undefined) {
      return other
    }

    if (bOrder === undefined) {
      return this
    }

    const maxOrder = Math.max(aOrder, bOrder)

    return UnivariatePolynomial.safeCreate(
      map(
        ([a, b]) => a + b,
        zipLongest(
          chain(this.coeff, repeat(0, maxOrder - aOrder)),
          chain(other.coeff, repeat(0, maxOrder - bOrder)),
        ),
      ),
    )
  }

  sub(other: UnivariatePolynomial): UnivariatePolynomial {
    return this.add(other.scaleBy(-1))
  }

  scaleBy(scalar: float64): UnivariatePolynomial {
    if (scalar === 0) {
      return ZERO_POLYNOMIAL
    }

    return new UnivariatePolynomial({
      coeff: this.coeff.map(c => c * scalar),
    })
  }

  mult(other: UnivariatePolynomial): UnivariatePolynomial {
    const aOrder = this.getDegree()
    const bOrder = other.getDegree()

    if (aOrder === undefined || bOrder === undefined) {
      return ZERO_POLYNOMIAL
    }

    const coeff: float64[] = []

    for (let k = 0; k < aOrder + bOrder + 1; k++) {
      let c = 0

      for (let i = 0; i <= k; i++) {
        if (i <= aOrder && k - i <= bOrder) {
          c += this.coeff[i] * other.coeff[k - i]
        }
      }

      coeff.push(c)
    }

    return new UnivariatePolynomial({ coeff })
  }

  divmod(other: UnivariatePolynomial): { quot: UnivariatePolynomial, rem: UnivariatePolynomial } {
    const aOrder = this.getDegree()
    const bOrder = other.getDegree()

    if (bOrder === undefined) {
      throw new ZeroUnivariatePolynomialError('Cannot divide by the zero polynomial')
    }

    if (aOrder === undefined || aOrder < bOrder) {
      return {
        quot: ZERO_POLYNOMIAL,
        rem: this,
      }
    }

    const aux = UnivariatePolynomial.getMonomial(aOrder - bOrder).scaleBy(
      this.getLeadingCoeff() / other.getLeadingCoeff(),
    )

    if (aOrder === 0) { // bOrder <= aOrder === 0
      return {
        quot: aux,
        rem: ZERO_POLYNOMIAL,
      }
    }

    const { quot, rem } = this.sub(other.mult(aux)).divmod(other)

    return {
      quot: quot.add(aux),
      rem,
    }
  }

  eval(x: float64): float64 {
    const order = this.getDegree()

    if (order === undefined) {
      return 0
    }

    let result = 0

    for (let i = order; i > 0; i--) {
      result = x * (this.coeff[i] + result)
    }

    result += this.coeff[0]
    return result
  }

  getDegree(): uint32 | undefined {
    if (this.coeff.length === 0) {
      return undefined
    }

    return this.coeff.length - 1
  }

  getLeadingCoeff(): float64 {
    const order = this.getDegree()

    if (order === undefined) {
      return 0
    }

    return this.coeff[order]
  }

  equals(other: UnivariatePolynomial, tolerance = DEFAULT_TOLERANCE): boolean {
    return this.getDegree() === other.getDegree() && all(([a, b]) => isClose(a, b, tolerance), zip(this.coeff, other.coeff))
  }

  getDerivative(): UnivariatePolynomial {
    const order = this.getDegree()

    if (order === undefined) {
      return ZERO_POLYNOMIAL
    }

    return UnivariatePolynomial.safeCreate(
      this.coeff.map((c, i) => c * i).slice(1),
    )
  }

  isZeroUnivariatePolynomial(): boolean {
    return this.coeff.length === 0
  }

  getRichTextEntry() {
    return mathml.linearCombination(
      this.coeff.toReversed(),
      Array.from(
        map(
          degree => {
            switch (degree) {
              case 0:
                return undefined
              case 1:
                return mathml.identifier('x')
              default: {
                return mathml.sup(
                  mathml.identifier('x'),
                  mathml.number(degree),
                )
              }
            }
          },
          range(this.coeff.length - 1, -1, -1),
        ),
      ),
    )
  }
}

export const ZERO_POLYNOMIAL = new UnivariatePolynomial({ coeff: [] })

function trimTrailingZeros(coeff: float64[]): float64[] {
  const index = coeff.findLastIndex(x => !isZero(x))

  if (index === -1) {
    return []
  }

  return coeff.slice(0, index + 1)
}
