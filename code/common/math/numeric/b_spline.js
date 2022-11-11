import { repr } from '../../../common/support/strings.js'
import { CoolError } from '../../../common/errors.js'

import { dividedDifferences } from './divided_differences.js'
import { stringifyNumber } from '../stringify.js'

export class BSplineError extends CoolError {}
export class NotEnoughPointsError extends BSplineError {}

/**
 * @implements TNumeric.IBSpline
 */
export class BSpline {
  /** @param {TNumeric.IBSplineParams} params */
  constructor({ points }) {
    if (points.length < 2) {
      throw new NotEnoughPointsError(`Expected at least two points, but given ${repr(points)}`)
    }

    this.points = points
  }

  /** @param {TNum.Float64} t */
  eval(t) {
    return dividedDifferences(x => x > t ? Math.pow(x - t, this.degree) : 0, this.points)
  }

  get degree() {
    return this.points.length - 2
  }

  toString() {
    return `B(${this.points.map(stringifyNumber).join(', ')})`
  }
}
