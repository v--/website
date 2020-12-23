import { repr } from '../support/strings.js'

import { BehaviorSubject } from './behavior_subject.js'
import { errors } from './errors.js'

export class DictSubject<T extends object> extends BehaviorSubject<T> {
  constructor(initial: T) {
    super(Object.freeze({ ...initial }))
  }

  next(value: T) {
    if (!(value instanceof Object)) {
      throw new errors.ErrorClass(`Expected an object, not ${repr(value)}`)
    }

    return super.next(value)
  }

  update(value: Partial<T>) {
    return this.next(Object.freeze({ ...this.value, ...value }))
  }
}
