import { CoolError } from '../../../common/errors.js'
import { c, Component } from '../../../common/rendering/component.js'

import { dispatcher } from '../render_dispatcher.js'
import { createIntervalObservable } from '../support/timeout.js'
import { combineLatest } from '../../../common/observables/combine.js'
import { windowSize$ } from '../shared_observables.js'
import { float64 } from '../../../common/types/numeric.js'
import { Optional } from '../../../common/types/typecons.js'
import { Renderer } from '../../../common/rendering/renderer.js'
import { WindowSize } from '../support/dom_observables.js'

export class AspectRatioError extends CoolError {}
export class NodeAlreadyRegisteredError extends AspectRatioError {}

const REFRESH_TIMEOUT = 300

let currentBox: Optional<Renderer<HTMLElement>>

function tryClamp(x: float64, min: float64, max: float64): float64 {
  if (typeof min === 'number' && x < min) {
    return min
  }

  if (typeof max === 'number' && x > max) {
    return max
  }

  return x
}

function setStyleIfNecessary(element: HTMLElement, propName: string, value: unknown) {
  const style = element.style as unknown as Record<string, unknown>

  if (style[propName] !== value) {
    style[propName] = value
  }
}

const resizeObserver = {
  next([windowSize, ]: [WindowSize, void]) {
    if (currentBox === undefined) {
      return
    }

    const box = currentBox.element!
    const subbox = box.firstChild! as HTMLElement
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
  next(node: Renderer<HTMLElement>) {
    if (node.component.type === aspectRatioBox) {
      if (currentBox) {
        throw new NodeAlreadyRegisteredError('There is already a registered aspect ratio box')
      }

      currentBox = node
    }
  }
})

dispatcher.events.destroy.subscribe({
  next(node: Renderer<HTMLElement>) {
    if (node.component.type === aspectRatioBox) {
      currentBox = undefined
    }
  }
})

export function aspectRatioBox({ item }: { item: Component }) {
  return c('div', { class: 'aspect-ratio-box' },
    c('div', { class: 'aspect-ratio-subbox' }, item)
  )
}
