import Observable from '../../../common/observables/observable.js'

export function createTimeoutObservable (period) {
  return new Observable(function (observer) {
    const timeout = setTimeout(function () {
      observer.next(period)
      observer.complete()
    }, period)

    return function () {
      clearTimeout(timeout)
    }
  })
}

export function createIntervalObservable (period) {
  return new Observable(function (observer) {
    const interval = setInterval(function () {
      observer.next(period)
    }, period)

    return function () {
      clearInterval(interval)
    }
  })
}
