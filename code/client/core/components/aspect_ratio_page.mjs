import { CoolError } from '../../../common/errors.mjs'
import { c } from '../../../common/rendering/component.mjs'

import { resize } from '../../core/observables.mjs'
import dispatcher from '../../core/render_dispatcher.mjs'

export class AspectRatioError extends CoolError {}
export class NodeAlreadyRegisteredError extends AspectRatioError {}

let currentRoot = null
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

const resizeObserver = {
  next () {
    if (!currentRoot || !currentBox) {
      return
    }

    const root = currentRoot.element
    const box = currentBox.element
    const boxState = currentBox.component.state.current

    const availableWidth = root.offsetWidth - root.offsetLeft - 2 * box.offsetLeft // Assume that the left offset describes the element's margin
    const clampedWidth = tryClamp(availableWidth, boxState.minWidth, boxState.maxWidth)
    let width = clampedWidth

    const availableHeight = root.offsetHeight - root.offsetTop - box.offsetTop - (boxState.bottomMargin || 0)
    const clampedHeight = tryClamp(availableHeight, boxState.minHeight, boxState.maxHeight)
    let height = clampedHeight

    if (clampedWidth / clampedHeight < boxState.ratio) {
      height = clampedWidth / boxState.ratio
    } else {
      width = clampedHeight * boxState.ratio
    }

    box.style.width = width + 'px'
    box.style.height = height + 'px'
    box.style.paddingLeft = (availableWidth - width) / 2 + 'px'
  }
}

resize.subscribe(resizeObserver)

dispatcher.events.create.subscribe({
  next (node) {
    if (node.component.type === aspectRatioPage) {
      if (currentRoot) {
        throw new NodeAlreadyRegisteredError('There is already a registered aspect ratio root')
      }

      currentRoot = node
    } else if (node.component.type === aspectRatioBox) {
      if (currentBox) {
        throw new NodeAlreadyRegisteredError('There is already a registered aspect ratio box')
      }

      currentBox = node
    }
  }
})

dispatcher.events.destroy.subscribe({
  next (node) {
    if (node.component.type === aspectRatioPage) {
      currentRoot = null
    } else if (node.component.type === aspectRatioBox) {
      currentBox = null
    }
  }
})

export function aspectRatioPage (state, children) {
  return c('div', state, ...children)
}

export function aspectRatioBox ({ item }) {
  return c('div', null, item)
}
