import { c } from '../../common/rendering/component.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { Vector } from '../../common/math/geom2d/vector.js'
import { throttleObservable } from '../../common/observables/throttle.js'

import { cursor$ } from '../core/shared_observables.js'
import { dispatcher } from '../core/render_dispatcher.js'
import { EventLoop } from '../core/support/event_loop.js'

import { evadingButtonCanvas } from './components/evading_button_canvas.js'
import { evade } from './evade.js'

// There is a lot of shared state here because I needed the event loop to know about global observables
const UPDATE_INTERVAL = 50
let sharedState = null

const subject = new DictSubject({
  buttonOrigin: new Vector({ x: 0.5, y: 0.5 })
})

const eventLoop = new EventLoop(new Map([
  [() => evade(sharedState, subject), UPDATE_INTERVAL]
]))

export function index () {
  return c('div', { class: 'page playground-evading-button-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'An evading button' })
    ),
    c(evadingButtonCanvas, subject)
  )
}

{
  let cursorSubscription = null

  dispatcher.events.create.subscribe({
    next (node) {
      if (node.component.type === evadingButtonCanvas) {
        sharedState = {
          canvasElement: node.element,
          cursor: new Vector({ x: 0, y: 0 })
        }

        cursorSubscription = throttleObservable(cursor$, UPDATE_INTERVAL).subscribe(function (cursor) {
          sharedState.cursor = cursor
        })

        eventLoop.start()
      }
    }
  })

  dispatcher.events.destroy.subscribe({
    next (node) {
      if (node.component.type === evadingButtonCanvas) {
        sharedState = null
        subject.update({
          buttonOrigin: new Vector({ x: 0.5, y: 0.5 })
        })

        if (eventLoop !== null) {
          eventLoop.stop()
        }

        if (cursorSubscription !== null) {
          cursorSubscription.unsubscribe()
        }
      }
    }
  })
}
