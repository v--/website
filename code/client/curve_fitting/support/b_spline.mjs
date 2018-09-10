import { repr } from '../../../common/support/strings.mjs'
import { CoolError } from '../../../common/errors.mjs'

import dividedDifferences from './divided_differences.mjs'

export class BSplineError extends CoolError {}
export class NotEnoughPointsError extends BSplineError {}

export default class BSpline {
  constructor (points) {
    if (points.length < 2) {
      throw new NotEnoughPointsError(`Expected at least two points, but given ${repr(points)}`)
    }

    this.points = points
  }

  evaluate (t) {
    return dividedDifferences(x => x > t ? Math.pow(x - t, this.degree) : 0, this.points)
  }

  get degree () {
    return this.points.length - 2
  }

  toString () {
    return `B(${this.points.join(', ')})`
  }
}
