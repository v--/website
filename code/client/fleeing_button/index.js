import { c } from '../../common/rendering/component.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { Vector } from '../../common/math/geom2d/vector.js'
import { throttleObservable } from '../../common/observables/throttle.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { cursor$ } from '../core/shared_observables.js'
import { dispatcher } from '../core/render_dispatcher.js'
import { EventLoop } from '../core/support/event_loop.js'

import { fleeingButtonCanvas } from './components/fleeing_button_canvas.js'
import { flee } from './flee.js'
import { Renderer } from '../../common/rendering/renderer.js'

// There is a lot of shared state here because I needed the event loop to know about global observables
const UPDATE_INTERVAL = 50
/** @type {import('./flee.js').SharedState | undefined} */
let sharedState

/** @type {DictSubject<import('./flee.js').SubjectState>} */
const subject = new DictSubject({
  buttonOrigin: new Vector({ x: 0.5, y: 0.5 })
})

const eventLoop = new EventLoop()
eventLoop.add(
  () => flee(sharedState, subject),
  UPDATE_INTERVAL
)

/**
 * @param {TRouter.IRouterState} state
 */
export function index({ path, description }) {
  return c('div', { class: 'page playground-fleeing-button-page' },
    c(sectionTitle, { class: 'fleeing-button-title', text: description, path }),
    c(fleeingButtonCanvas, subject)
  )
}

{
  /** @type {TObservables.ISubscription | undefined} */
  let cursorSubscription

  dispatcher.events.create.subscribe({
    /** @param {Renderer<HTMLElement>} node */
    next(node) {
      if (node.component.type === fleeingButtonCanvas) {
        sharedState = {
          canvasElement: /** @type {HTMLCanvasElement} */ (node.element),
          cursor: new Vector({ x: 0, y: 0 })
        }

        cursorSubscription = throttleObservable(cursor$, UPDATE_INTERVAL).subscribe(cursor => {
          if (sharedState) {
            sharedState.cursor = cursor
          }
        })

        eventLoop.start()
      }
    }
  })

  dispatcher.events.destroy.subscribe({
    /** @param {Renderer<HTMLElement>} node */
    next(node) {
      if (node.component.type === fleeingButtonCanvas) {
        sharedState = undefined

        subject.update({
          buttonOrigin: new Vector({ x: 0.5, y: 0.5 })
        })

        if (eventLoop) {
          eventLoop.stop()
        }

        if (cursorSubscription) {
          cursorSubscription.unsubscribe()
        }
      }
    }
  })
}
