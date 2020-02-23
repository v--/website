import {
  createWindowSizeObservable,
  createCursorObservable,
  createKeyDownObservable,
  createKeyUpObservable
} from './support/dom_observables.js'

export const windowSize$ = createWindowSizeObservable()
export const cursor$ = createCursorObservable()
export const keyDown$ = createKeyDownObservable()
export const keyUp$ = createKeyUpObservable()
