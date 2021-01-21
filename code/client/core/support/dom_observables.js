import { Subject } from '../../../common/observables/subject.js'
import { BehaviorSubject } from '../../../common/observables/behavior_subject.js'

import { Vector } from '../../../common/math/geom2d/vector.js'

/**
 * @typedef {object} WindowSize
 * @property {TNum.UInt32} width
 * @property {TNum.UInt32} height
 * @property {boolean} isDesktop
 */

/**
 * @returns {BehaviorSubject<WindowSize>}
 */
export function createWindowSizeObservable() {
  /** @returns {WindowSize} */
  function getWindowSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isDesktop: window.innerWidth >= window.DESKTOP_WIDTH
    }
  }

  const subject = new BehaviorSubject(getWindowSize())

  function triggerUpdate() {
    subject.next(getWindowSize())
  }

  subject.subscribe({
    complete() {
      window.removeEventListener('resize', triggerUpdate)
    }
  })

  window.addEventListener('resize', triggerUpdate)
  return subject
}

/**
 * @returns {TObservables.IObservable<string>}
 */
export function createKeyDownObservable() {
  const subject = new Subject()

  /** @param {KeyboardEvent} event */
  function onKeyDown(event) {
    subject.next(event.key)
  }

  subject.subscribe({
    complete() {
      window.document.removeEventListener('keydown', onKeyDown)
    }
  })

  window.document.addEventListener('keydown', onKeyDown)
  return subject
}

/**
 * @returns {TObservables.IObservable<string>}
 */
export function createKeyUpObservable() {
  const subject = new Subject()

  /** @param {KeyboardEvent} event */
  function onKeyDown(event) {
    subject.next(event.key)
  }

  subject.subscribe({
    complete() {
      window.document.removeEventListener('keyup', onKeyDown)
    }
  })

  window.document.addEventListener('keyup', onKeyDown)
  return subject
}

/**
 * @returns {TObservables.IObservable<Vector>}
 */
export function createCursorObservable() {
  /** @type {Subject<Vector>} */
  const subject = new Subject()

  /** @param {MouseEvent} event */
  function onMouseMove(event) {
    subject.next(new Vector({
      x: event.clientX,
      y: event.clientY
    }))
  }

  subject.subscribe({
    complete() {
      window.document.removeEventListener('mouseover', onMouseMove)
      window.document.removeEventListener('mousemove', onMouseMove)
      window.document.removeEventListener('mouseleave', onMouseMove)
    }
  })

  window.document.addEventListener('mouseover', onMouseMove)
  window.document.addEventListener('mousemove', onMouseMove)
  window.document.addEventListener('mouseleave', onMouseMove)
  return subject
}
