import { repr } from '../support/strings.js'

import BehaviorSubject from './behavior_subject.js'
import errors from './errors.js'

export default class DictSubject extends BehaviorSubject {
  constructor (initial = {}) {
    super(initial)
  }

  next (value) {
    if (!(value instanceof Object)) {
      throw new errors.ObservableError(`Expected an object, not ${repr(value)}`)
    }

    return super.next(value)
  }

  update (value) {
    return this.next(Object.assign({}, this.value, value))
  }
}
