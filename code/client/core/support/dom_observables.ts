/* eslint-env browser */

import { Subject } from '../../../common/observables/subject.js'
import { BehaviorSubject } from '../../../common/observables/behavior_subject.js'

import { Vector } from '../../../common/math/geom2d/vector.js'

export interface WindowSize {
  width: number
  height: number
  isDesktop: boolean
}

export function createWindowSizeObservable(): BehaviorSubject<WindowSize> {
  function getWindowSize(): WindowSize {
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

export function createKeyDownObservable(): Observables.IObservable<string> {
  const subject = new Subject()

  function onKeyDown(event: KeyboardEvent) {
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

export function createKeyUpObservable(): Observables.IObservable<string> {
  const subject = new Subject()

  function onKeyDown(event: KeyboardEvent) {
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

export function createCursorObservable(): Observables.IObservable<Vector> {
  const subject = new Subject<Vector>()

  function onMouseMove(event: MouseEvent) {
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
