import { c } from '../../common/rendering/component.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { Vector } from '../../common/math/geom2d/vector.js'
import { Rectangle } from '../../common/math/geom2d/rectangle.js'
import { throttleObservable } from '../../common/observables/throttle.js'

import { dispatcher } from '../core/render_dispatcher.js'
import { createMousePositionObservable } from '../core/support/dom_observables.js'
import { EventLoop } from '../core/support/event_loop.js'
import { getBoundingBox, getDimensions } from '../core/support/dom_properties.js'

import { evadingButtonCanvas } from './components/evading_button_canvas.js'
import { evade } from './evade.js'

const UPDATE_INTERVAL = 50
const mousePosition = new Vector({ x: 0, y: 0 })

const subject = new DictSubject({
  button: null,
  canvas: null
})

let eventLoop = null

export function index () {
  const eventLoopListeners = new Map([
    [evade.bind(null, subject, mousePosition), UPDATE_INTERVAL]
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
  let mousePosSubscription = null

  dispatcher.events.create.subscribe({
    next (node) {
      if (node.component.type === evadingButtonCanvas) {
        const mousePosObservable = throttleObservable(createMousePositionObservable(), UPDATE_INTERVAL)
        mousePosSubscription = mousePosObservable.subscribe(function (pos) {
          mousePosition.x = pos.x
          mousePosition.y = pos.y
        })

        window.requestAnimationFrame(function () {
          const canvas = getBoundingBox(node.element)
          const buttonDims = getDimensions(node.element.firstChild)
          const button = new Rectangle({
            origin: canvas.center.sub(buttonDims.scale(0.5)),
            dims: buttonDims
          })

          subject.update({ canvas, button })
          eventLoop.start()
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

        if (mousePosSubscription !== null) {
          mousePosSubscription.unsubscribe()
        }
      }
    }
  })
}
