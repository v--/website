import { type IMathMLEntry, mathml } from '../../../common/rich.ts'
import { intersperse } from '../../../common/support/iteration.ts'
import { type uint32 } from '../../../common/types/numbers.ts'

export class ComplexityMathMLHelper {
  #getComplexityEntry(identifier: string, value: IMathMLEntry | string | uint32) {
    const entry = typeof value === 'string' ?
        mathml.identifier(value) :
      typeof value === 'number' ? mathml.number(value) : value

    return mathml.functionApplication(
      mathml.identifier(identifier, 'upright'),
      [entry],
    )
  }

  logLinear(identifier: string) {
    return mathml.row(
      mathml.identifier(identifier),
      mathml.thinmuskip(),
      mathml.identifier('log'),
      mathml.thinmuskip(),
      mathml.identifier(identifier),
    )
  }

  pow(identifier: string, power: uint32) {
    return mathml.sup(
      mathml.identifier(identifier),
      mathml.number(power),
    )
  }

  root(...entries: IMathMLEntry[]) {
    return mathml.root(
      'inline',
      ...intersperse(
        entries,
        mathml.operator(';', 'separator'),
      ),
    )
  }

  bigOmega(value: IMathMLEntry | string | uint32) {
    return this.#getComplexityEntry('Ω', value)
  }

  smallOmega(value: IMathMLEntry | string | uint32) {
    return this.#getComplexityEntry('ω', value)
  }

  bigO(value: IMathMLEntry | string | uint32) {
    return this.#getComplexityEntry('O', value)
  }

  smallO(value: IMathMLEntry | string | uint32) {
    return this.#getComplexityEntry('o', value)
  }

  theta(value: IMathMLEntry | string | uint32) {
    return this.#getComplexityEntry('Θ', value)
  }
}

export const complexity = new ComplexityMathMLHelper()
