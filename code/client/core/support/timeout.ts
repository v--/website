import { Observable } from '../../../common/observables/observable.js'
import { uint32 } from '../../../common/types/numeric.js'

export function createTimeoutObservable(period: uint32) {
  return new Observable<void>(function(observer) {
    const timeout = setTimeout(function() {
      observer.next()
      observer.complete()
    }, period)

    return function() {
      clearTimeout(timeout)
    }
  })
}

export function createIntervalObservable(period: uint32) {
  return new Observable<void>(function(observer) {
    const interval = setInterval(function() {
      observer.next()
    }, period)

    return function() {
      clearInterval(interval)
    }
  })
}
