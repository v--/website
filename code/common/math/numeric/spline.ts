import { BSpline } from './b_spline.ts'
import { type ISymbolicFunction } from './types.ts'
import { mathml } from '../../rich.ts'
import { zip } from '../../support/iteration.ts'
import { type float64 } from '../../types/numbers.ts'

export interface ISplineConfig {
  basis: BSpline[]
  coeff: float64[]
}

export class Spline implements ISplineConfig, ISymbolicFunction<float64> {
  readonly basis: BSpline[]
  readonly coeff: float64[]

  constructor({ basis, coeff }: ISplineConfig) {
    this.basis = basis
    this.coeff = coeff
  }

  eval(x: float64) {
    // TODO: Remove Array.from once Iterator.prototype.reduce() proliferates
    return Array.from(zip(this.coeff, this.basis)).reduce(
      (accum, [coeff, fun]) => accum + coeff * fun.eval(x),
      0,
    )
  }

  getRichTextEntry() {
    return mathml.linearCombination(
      this.coeff,
      this.basis.map(b => b.getRichTextEntry()),
      mathml.thinmuskip(),
    )
  }
}
