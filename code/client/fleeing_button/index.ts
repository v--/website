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
import { RouterState } from '../../common/support/router_state.js'
import { SharedState, SubjectState } from './types/state.js'

// There is a lot of shared state here because I needed the event loop to know about global observables
const UPDATE_INTERVAL = 50
let sharedState: SharedState | undefined

const subject = new DictSubject<SubjectState>({
  buttonOrigin: new Vector({ x: 0.5, y: 0.5 })
})

const eventLoop = new EventLoop()
eventLoop.add(
  () => flee(sharedState, subject),
  UPDATE_INTERVAL
)

export function index({ path, description }: RouterState) {
  return c('div', { class: 'page playground-fleeing-button-page' },
    c(sectionTitle, { class: 'fleeing-button-title', text: description, path }),
    c(fleeingButtonCanvas, subject)
  )
}

{
  let cursorSubscription: TObservables.ISubscription

  dispatcher.events.create.subscribe({
    next(node: Renderer<HTMLElement>) {
      if (node.component.type === fleeingButtonCanvas) {
        sharedState = {
          canvasElement: node.element as HTMLCanvasElement,
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
    next(node: Renderer<HTMLElement>) {
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
