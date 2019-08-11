import { repr } from '../support/strings.js'

import BehaviorSubject from './behavior_subject.js'
import errors from './errors.js'

export default class DictSubject extends BehaviorSubject {
  constructor (initial = {}) {
    super(Object.freeze(Object.assign({}, initial)))
  }

  next (value) {
    if (!(value instanceof Object)) {
      throw new errors.ErrorClass(`Expected an object, not ${repr(value)}`)
    }

    return super.next(value)
  }

  update (value) {
    return this.next(Object.freeze(Object.assign({}, this.value, value)))
  }
}
