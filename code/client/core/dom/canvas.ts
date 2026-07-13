import { CanvasError } from './errors.ts'
import { Observable } from '../../../common/observable.ts'
import { repr } from '../../../common/support/strings.ts'

const CANVAS_POLL_INTERVAL_MS = 100

/**
 * Our component system avoids references to HTML elements,
 * however acquiring the context of a canvas requires a reference to the canvas.
 *
 * We try to solve this by polling for a canvas with a certain DOM id.
 */
export function getCanvas$(canvasId: string): Observable<HTMLCanvasElement> {
  return new Observable(function (observer) {
    const intervalId = setInterval(
      function () {
        const canvas = document.getElementById(canvasId)

        if (canvas instanceof HTMLCanvasElement) {
          observer.next(canvas)
          clearInterval(intervalId)
        }
      },
      CANVAS_POLL_INTERVAL_MS,
    )

    return function unsubscribe() {
      clearInterval(intervalId)
    }
  })
}

/**
 * Our component system avoids references to HTML elements,
 * however acquiring the context of a canvas requires a reference to the canvas.
 *
 * We try to solve this by polling for a canvas with a certain DOM id.
 */
export function getCanvasContext(canvas: HTMLCanvasElement, contextType: '2d'): CanvasRenderingContext2D
export function getCanvasContext(canvas: HTMLCanvasElement, contextType: string): RenderingContext {
  const ctx = canvas.getContext(contextType)

  if (ctx) {
    return ctx
  }

  throw new CanvasError(`Could not obtain a canvas context of type ${repr(contextType)}`)
}
