import { dividedDifferences } from './divided_differences.ts'
import { KnotExistenceError } from './errors.ts'
import { type ISymbolicFunction } from './types.ts'
import { type IMathMLEntry, mathml } from '../../rich.ts'
import { type float64 } from '../../types/numbers.ts'

export interface IBSplineConfig {
  points: float64[]
}

export class BSpline implements IBSplineConfig, ISymbolicFunction<float64> {
  readonly points: float64[]

  constructor({ points }: IBSplineConfig) {
    if (points.length < 2) {
      throw new KnotExistenceError('A B-spline requires at least two points', { points })
    }

    this.points = points
  }

  eval(t: float64) {
    return dividedDifferences(x => x > t ? Math.pow(x - t, this.getDegree()) : 0, this.points)
  }

  getDegree() {
    return this.points.length - 2
  }

  getRichTextEntry(): IMathMLEntry {
    return mathml.functionApplication(
      mathml.identifier('B', 'upright'),
      this.points.map(t => mathml.number(t)),
      [mathml.identifier('x')],
    )
  }
}
