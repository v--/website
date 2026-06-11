import { type uint32 } from '../../../common/types/numbers.ts'
import { Observable } from '../observable.ts'

export function timeInterval(milliseconds: uint32): Observable<void> {
  return new Observable(function (observer) {
    const intervalId = setInterval(
      function () {
        // We handle this asynchronously because Chrome complains if the handler is slow to process
        queueMicrotask(observer.next)
      },
      milliseconds,
    )

    return function unsubscribe() {
      clearInterval(intervalId)
    }
  })
}
