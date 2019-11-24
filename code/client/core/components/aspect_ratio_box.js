import { CoolError } from '../../../common/errors.js'
import { c } from '../../../common/rendering/component.js'

import { dispatcher } from '../render_dispatcher.js'
import { createIntervalObservable } from '../support/timeout.js'

export class AspectRatioError extends CoolError {}
export class NodeAlreadyRegisteredError extends AspectRatioError {}

const REFRESH_TIMEOUT = 300

let currentBox = null

function tryClamp (x, min, max) {
  if (typeof min === 'number' && x < min) {
    return min
  }

  if (typeof max === 'number' && x > max) {
    return max
  }

  return x
}

function setStyleIfNecessary (element, propName, value) {
  if (element.style[propName] !== value) {
    element.style[propName] = value
  }
}

const resizeObserver = {
  next () {
    if (currentBox === null) {
      return
    }

    const box = currentBox.element
    const subbox = box.firstChild
    const boxState = currentBox.component.state.value

    const availableWidth = box.offsetWidth
    const clampedWidth = tryClamp(availableWidth, boxState.minWidth, boxState.maxWidth)
    let width = clampedWidth

    const availableHeight = window.innerHeight - box.offsetTop - (boxState.bottomMargin || 0)
    const clampedHeight = tryClamp(availableHeight, boxState.minHeight, boxState.maxHeight)
    let height = clampedHeight

    if (clampedWidth / clampedHeight < boxState.ratio) {
      height = clampedWidth / boxState.ratio
    } else {
      width = clampedHeight * boxState.ratio
    }

    // const padding = (availableWidth - width) / 2
    const padding = 0

    setStyleIfNecessary(box, 'opacity', '1')
    setStyleIfNecessary(subbox, 'width', width + 'px')
    setStyleIfNecessary(subbox, 'height', height + 'px')
    setStyleIfNecessary(box, 'height', height + 'px')
    setStyleIfNecessary(subbox, 'paddingLeft', padding + 'px')
  }
}

createIntervalObservable(REFRESH_TIMEOUT).subscribe(resizeObserver)

dispatcher.events.create.subscribe({
  next (node) {
    if (node.component.type === aspectRatioBox) {
      if (currentBox) {
        throw new NodeAlreadyRegisteredError('There is already a registered aspect ratio box')
      }

      currentBox = node
    }
  }
})

dispatcher.events.destroy.subscribe({
  next (node) {
    if (node.component.type === aspectRatioBox) {
      currentBox = null
    }
  }
})

export function aspectRatioBox ({ item }) {
  return c('div', { class: 'aspect-ratio-box' },
    c('div', { class: 'aspect-ratio-subbox' }, item)
  )
}
