import { Observable } from '../../../common/support/observable'
import { sort } from '../../../common/support/iteration'

import fitters from '../fitters'

class DiscreteMap {
  constructor () {
    this._payload = new Map()
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

  get domain () {
    return new Set(this._payload.keys())
  }

  get range () {
    return new Set(this._payload.values())
  }
}

function recalculateCurves (mapping) {
  const points = sort(mapping.domain)

  function fun (x) {
    return mapping.get(x)
  }

  return fitters.map(function (fitter) {
    const curve = fitter.fit(fun, points)
    return { curve, fitter }
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
