import { CHALK_COLORS } from '../../core/support/colors.mjs'

import { Observable } from '../../../common/support/observable.mjs'
import { sort } from '../../../common/support/iteration.mjs'

import fitters from '../fitters.mjs'

export class DiscreteMap {
  constructor (values) {
    this._payload = new Map(values)
  }

  set (arg, val) {
    this._payload.set(arg, val)
  }

  get (arg) {
    if (this._payload.has(arg)) {
      return this._payload.get(arg)
    }

    return null
  }

  delete (arg) {
    this._payload.delete(arg)
  }

  get n () {
    return this._payload.size
  }

  get domain () {
    return sort(this._payload.keys())
  }

  get range () {
    return this.domain.map(x => this.get(x))
  }
}

function recalculateCurves (mapping) {
  return fitters.map(function (fitter, i) {
    const curve = fitter.fit(mapping)
    return { curve, fitter, color: CHALK_COLORS[i] }
  })
}

export default class GridObservable extends Observable {
  constructor (width, height) {
    const mapping = new DiscreteMap()

    mapping.set(-7, 2)
    mapping.set(0, -2)
    mapping.set(5, 1)
    mapping.set(8, -3)

    super({
      width,
      height,
      curves: recalculateCurves(mapping),
      mapping: Object.create(mapping, {
        set: {
          value: (arg, val) => {
            mapping.set(arg, val)
            this.update({
              curves: recalculateCurves(mapping)
            })
          }
        },

        delete: {
          value: (arg) => {
            mapping.delete(arg)
            this.update({
              curves: recalculateCurves(mapping)
            })
          }
        }
      })
    })
  }
}
