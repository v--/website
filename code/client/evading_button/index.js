import { c } from '../../common/rendering/component.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { Vector } from '../../common/math/geom2d/vector.js'
import { Rectangle } from '../../common/math/geom2d/rectangle.js'
import { throttleObservable } from '../../common/observables/throttle.js'

import { cursor$, windowSize$ } from '../core/shared_observables.js'
import { dispatcher } from '../core/render_dispatcher.js'
import { EventLoop } from '../core/support/event_loop.js'
import { getBoundingBox, getDimensions } from '../core/support/dom_properties.js'

import { evadingButtonCanvas } from './components/evading_button_canvas.js'
import { evade } from './evade.js'

const UPDATE_INTERVAL = 50
const cursorition = new Vector({ x: 0, y: 0 })

const subject = new DictSubject({
  button: null,
  canvas: null
})

let eventLoop = null

export function index () {
  const eventLoopListeners = new Map([
    [evade.bind(null, subject, cursorition), UPDATE_INTERVAL]
  ])

  eventLoop = new EventLoop(eventLoopListeners)

  return c('div', { class: 'page playground-evading-button-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'An evading button' })
    ),
    c(evadingButtonCanvas, subject)
  )
}

{
  let cursorSubscription = null
  let windowSizeSubscription = null

  function initialize (node) {
    const canvas = getBoundingBox(node.element)
    const buttonDims = getDimensions(node.element.firstChild)
    const button = new Rectangle({
      origin: canvas.center.sub(buttonDims.scale(0.5)),
      dims: buttonDims
    })

    subject.update({ canvas, button })
    eventLoop.start()
  }

  dispatcher.events.create.subscribe({
    next (node) {
      if (node.component.type === evadingButtonCanvas) {
        cursorSubscription = throttleObservable(cursor$, UPDATE_INTERVAL).subscribe(function (pos) {
          cursorition.x = pos.x
          cursorition.y = pos.y
        })

        windowSizeSubscription = throttleObservable(windowSize$, UPDATE_INTERVAL).subscribe(function () {
          initialize(node)
        })

        window.requestAnimationFrame(function () {
          initialize(node)
        })
      }
    }
  })

  dispatcher.events.destroy.subscribe({
    next (node) {
      if (node.component.type === evadingButtonCanvas) {
        subject.update({ canvas: null, button: null })

        if (eventLoop !== null) {
          eventLoop.stop()
        }

        if (cursorSubscription !== null) {
          cursorSubscription.unsubscribe()
        }

        if (windowSizeSubscription !== null) {
          windowSizeSubscription.unsubscribe()
        }
      }
    }
  })
}
