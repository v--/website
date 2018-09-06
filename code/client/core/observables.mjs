import { ResizeObservable } from './support/dom'

export const resize = window.resizeObservable ? window.resizeObservable : new ResizeObservable()
window.resizeObservable = resize
