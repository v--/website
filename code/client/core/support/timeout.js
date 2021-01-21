import { Observable } from '../../../common/observables/observable.js'

/**
 * @param {TNum.UInt32} period
 */
export function createTimeoutObservable(period) {
  return new Observable(
    /** @param {TObservables.IObserver<void>} observer */
    function(observer) {
      const timeout = setTimeout(function() {
        observer.next()
        observer.complete()
      }, period)

      return function() {
        clearTimeout(timeout)
      }
    }
  )
}

/**
 * @param {TNum.UInt32} period
 */
export function createIntervalObservable(period) {
  return new Observable(
    /** @param {TObservables.IObserver<void>} observer */
    function(observer) {
      const interval = setInterval(function() {
        observer.next()
      }, period)

      return function() {
        clearInterval(interval)
      }
    }
  )
}
