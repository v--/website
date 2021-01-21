import { CoolError } from '../../../common/errors.js'
import { c, Component } from '../../../common/rendering/component.js'

import { dispatcher } from '../render_dispatcher.js'
import { createIntervalObservable } from '../support/timeout.js'
import { combineLatest } from '../../../common/observables/combine.js'
import { windowSize$ } from '../shared_observables.js'
import { WindowSize } from '../support/dom_observables.js'

export class AspectRatioError extends CoolError {}
export class NodeAlreadyRegisteredError extends AspectRatioError {}

const REFRESH_TIMEOUT = 300

/** @type {TRendering.IRenderEvent<HTMLElement> | undefined} */
let currentBox

/**
 * @param {TNum.Float64} x
 * @param {TNum.Float64} min
 * @param {TNum.Float64} max
 * @returns {TNum.Float64}
 */
function tryClamp(x, min, max) {
  if (typeof min === 'number' && x < min) {
    return min
  }

  if (typeof max === 'number' && x > max) {
    return max
  }

  return x
}

/**
 * @param {HTMLElement} element
 * @param {string} propName
 * @param {unknown} value
 */
function setStyleIfNecessary(element, propName, value) {
  const style = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (element.style))

  if (style[propName] !== value) {
    style[propName] = value
  }
}

const resizeObserver = {
  /** @param {[WindowSize, void]} value */
  next([windowSize, ]) {
    if (currentBox === undefined) {
      return
    }

    const box = /** @type {HTMLElement} */ (currentBox.element)
    const subbox = /** @type {HTMLElement} */ (box.firstChild)
    const boxState = currentBox.component.state.value

    const availableWidth = box.offsetWidth
    const clampedWidth = tryClamp(availableWidth, boxState.minWidth, boxState.maxWidth)
    let width = clampedWidth

    const availableHeight = windowSize.height - box.offsetTop - (boxState.bottomMargin || 0)
    const clampedHeight = tryClamp(availableHeight, boxState.minHeight, boxState.maxHeight)
    let height = clampedHeight

    if (clampedWidth / clampedHeight < boxState.ratio) {
      height = clampedWidth / boxState.ratio
    } else {
      width = clampedHeight * boxState.ratio
    }

    const padding = 0

    setStyleIfNecessary(box, 'opacity', '1')
    setStyleIfNecessary(subbox, 'width', width + 'px')
    setStyleIfNecessary(subbox, 'height', height + 'px')
    setStyleIfNecessary(box, 'height', height + 'px')
    setStyleIfNecessary(subbox, 'paddingLeft', padding + 'px')
  }
}

combineLatest(windowSize$, createIntervalObservable(REFRESH_TIMEOUT))
  .subscribe(resizeObserver)

dispatcher.events.create.subscribe({
  next(node) {
    if (node.component.type === aspectRatioBox) {
      if (currentBox) {
        throw new NodeAlreadyRegisteredError('There is already a registered aspect ratio box')
      }

      currentBox = /** @type {TRendering.IRenderEvent<HTMLElement>} */ (node)
    }
  }
})

dispatcher.events.destroy.subscribe({
  next(node) {
    if (node.component.type === aspectRatioBox) {
      currentBox = undefined
    }
  }
})

/**
 * @param {{ item: Component }} state
 */
export function aspectRatioBox({ item }) {
  return c('div', { class: 'aspect-ratio-box' },
    c('div', { class: 'aspect-ratio-subbox' }, item)
  )
}
