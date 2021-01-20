import { Observable } from '../../../common/observables/observable.js'

export function createTimeoutObservable(period: TNum.UInt32) {
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

export function createIntervalObservable(period: TNum.UInt32) {
  return new Observable<void>(function(observer) {
    const interval = setInterval(function() {
      observer.next()
    }, period)

    return function() {
      clearInterval(interval)
    }
  })
}
