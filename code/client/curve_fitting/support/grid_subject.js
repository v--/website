import { CHALK_COLORS } from '../../core/support/colors.js'

import DictSubject from '../../../common/observables/dict_subject.js'
import { sort } from '../../../common/support/iteration.js'

import fitters from '../fitters.js'

export const ZERO = {
  eval (x) {
    return 0
  },

  toString () {
    return '0'
  }
}

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

export default class GridSubject extends DictSubject {
  constructor (width, height) {
    const mapping = new DiscreteMap()

    mapping.set(-7, 2)
    mapping.set(0, -2)
    mapping.set(5, 1)
    mapping.set(8, -3)

    super({
      width,
      height,
      mapping: Object.create(mapping, {
        set: {
          value: (arg, val) => {
            mapping.set(arg, val)
            this.update({
              curves: this._recalculateCurves(mapping)
            })
          }
        },

        delete: {
          value: (arg) => {
            mapping.delete(arg)
            this.update({
              curves: this._recalculateCurves(mapping)
            })
          }
        }
      })
    })

    this.update({
      curves: this._recalculateCurves(mapping),
      fittersShown: new Map(fitters.map(f => [f, !f.hideByDefault]))
    })
  }

  _recalculateCurves (mapping) {
    return fitters
      .map(function (fitter, i) {
        const curve = mapping.n === 0 ? ZERO : fitter.fit(mapping)

        return {
          curve,
          fitter,
          color: CHALK_COLORS[i],
          toggle: () => {
            const fs = this.value.fittersShown
            fs.set(fitter, !fs.get(fitter))
            this.update()
          }
        }
      }.bind(this))
  }
}
