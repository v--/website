import { median } from '../../../common/math/prob.ts'
import { type IObserver, Observable } from '../../../common/observable.ts'
import { CircularBuffer } from '../../../common/support/circular_buffer.ts'
import { type float64, type uint32 } from '../../../common/types/numbers.ts'

export function fromEvent(target: EventTarget, eventName: 'touchdown' | 'touchup' | 'touchmove' | 'touchcancel'): Observable<TouchEvent>
export function fromEvent(target: EventTarget, eventName: 'mousedown' | 'mouseup' | 'mousemove'): Observable<MouseEvent>
export function fromEvent(target: EventTarget, eventName: 'pointerdown' | 'pointerup' | 'pointermove' | 'click'): Observable<PointerEvent>
export function fromEvent(target: EventTarget, eventName: 'keyup' | 'keydown'): Observable<KeyboardEvent>
export function fromEvent(target: EventTarget, eventName: 'popstate'): Observable<PopStateEvent>
export function fromEvent(target: EventTarget, eventName: 'error'): Observable<ErrorEvent>
export function fromEvent(target: EventTarget, eventName: 'unhandledrejection'): Observable<PromiseRejectionEvent>
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

export const DEFAULT_FPS = 60
const FRAME_OBSERVABLE_FPS_BUFFER_SIZE = 5

/**
 * An observable that emits the current FPS on every animation frame.
 */
export function animationFrameObservable(): Observable<uint32> {
  return new Observable(observer => {
    let continueRecursing = false
    const lastCallDurations = new CircularBuffer<float64>(FRAME_OBSERVABLE_FPS_BUFFER_SIZE)
    let lastCallTimestamp = performance.now()

    function recurse() {
      const thisCallTimestamp = performance.now()
      lastCallDurations.push(thisCallTimestamp - lastCallTimestamp)
      lastCallTimestamp = thisCallTimestamp
      // The median is useful here because one slow or fast frame drawing does not affect it.
      // Even without fluctuations, when resetting, the confirmation may take an arbitrary amount of time
      // that is counted towards the FPS if we use the mean.
      const medianDuration = median(lastCallDurations)
      observer.next(Math.round(1000 / medianDuration))

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
