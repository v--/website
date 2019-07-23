import { repr } from '../support/strings.mjs'

import BehaviorSubject from './observable.mjs'
import errors from './errors.mjs'

export default class DictSubject extends BehaviorSubject {
  constructor (initial = {}) {
    super(initial)
  }

  next (value) {
    if (!(value instanceof Object)) {
      throw new errors.ObservableError(`Expected an object, not ${repr(value)}`)
    }

    super.next(value)
  }

  update (value) {
    super.next(Object.assign(this.value, value))
  }
}
