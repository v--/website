import { calcQuantile } from '../../../common/math/stat/descriptive.ts'
import { type IObserver, Observable } from '../../../common/observable.ts'
import { CircularBuffer } from '../../../common/support/circular-buffer.ts'
import { type float64 } from '../../../common/types/numbers.ts'

export function fromEvent(target: EventTarget, eventName: 'touchdown' | 'touchup' | 'touchmove' | 'touchcancel'): Observable<TouchEvent>
export function fromEvent(target: EventTarget, eventName: 'mousedown' | 'mouseup' | 'mousemove'): Observable<MouseEvent>
export function fromEvent(target: EventTarget, eventName: 'pointerdown' | 'pointerup' | 'pointermove' | 'click'): Observable<PointerEvent>
export function fromEvent(target: EventTarget, eventName: 'keyup' | 'keydown'): Observable<KeyboardEvent>
export function fromEvent(target: EventTarget, eventName: 'popstate'): Observable<PopStateEvent>
export function fromEvent(target: EventTarget, eventName: 'error'): Observable<ErrorEvent>
export function fromEvent(target: EventTarget, eventName: 'unhandledrejection'): Observable<PromiseRejectionEvent>
export function fromEvent(target: EventTarget, eventName: 'focus' | 'blur'): Observable<FocusEvent>
export function fromEvent(target: EventTarget, eventName: 'resize'): Observable<Event>
export function fromEvent<T>(target: EventTarget, eventName: 'message'): Observable<MessageEvent<T>>
export function fromEvent(target: EventTarget, eventName: string): Observable<Event>
export function fromEvent(target: EventTarget, eventName: string): Observable<Event> {
  return new Observable(function (observer: IObserver<Event>) {
    function listener(event: Event) {
      observer.next(event)
    }

    target.addEventListener(eventName, listener)

    return function unsubscribe() {
      target.removeEventListener(eventName, listener)
    }
  })
}

export const DEFAULT_FRAME_DURATION = 1000 / 60
const FRAME_OBSERVABLE_BUFFER_SIZE = 10

/**
 * An observable that emits an estimated call duration on every animation frame.
 */
export function animationFrameObservable(): Observable<float64> {
  return new Observable(observer => {
    let continueRecursing = false
    const lastCallDurations = new CircularBuffer<float64>(FRAME_OBSERVABLE_BUFFER_SIZE)
    let lastCallTimestamp = performance.now()

    function recurse() {
      const thisCallTimestamp = performance.now()

      // During the first call, thisCallTimestamp could almost coincide with lastCallTimestamp,
      // which can cause arbitrary things that depend on the refresh rate to fail.
      if (lastCallDurations.getSize() === 0) {
        observer.next(Math.round(DEFAULT_FRAME_DURATION))
      } else {
        lastCallDurations.push(thisCallTimestamp - lastCallTimestamp)
        lastCallTimestamp = thisCallTimestamp
        // The median is useful here because one slow or fast frame drawing does not affect it.
        // Even without fluctuations, when resetting, the confirmation may take an arbitrary amount of time
        // that is counted towards the call duration if we use the mean.
        const medianDuration = calcQuantile(lastCallDurations, 0.5)
        observer.next(Math.round(medianDuration))
      }

      if (!continueRecursing) {
        requestAnimationFrame(recurse)
      }
    }

    requestAnimationFrame(recurse)

    return function unsubscribe() {
      continueRecursing = true
    }
  })
}
