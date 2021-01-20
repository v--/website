import { repr } from '../support/strings.js'

import { BehaviorSubject } from './behavior_subject.js'
import { errors } from './errors.js'

/**
 * @template T extends object
 * @extends BehaviorSubject<T>
 */
export class DictSubject extends BehaviorSubject {
  /**
   * @param {T} initial
   */
  constructor(initial) {
    super(Object.freeze({ ...initial }))
  }

  /**
   * @param {T} newValue
   */
  next(newValue) {
    if (!(newValue instanceof Object)) {
      throw new errors.ErrorClass(`Expected an object, not ${repr(newValue)}`)
    }

    return super.next(newValue)
  }

  /**
   * @param {Partial<T>} newValue
   */
  update(newValue) {
    return this.next(Object.freeze({ ...this.value, ...newValue }))
  }
}
