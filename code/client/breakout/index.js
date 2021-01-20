import { c } from '../../common/rendering/component.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { dispatcher } from '../core/render_dispatcher.js'
import { EventLoop } from '../core/support/event_loop.js'
import { keyDown$, keyUp$ } from '../core/shared_observables.js'

import { breakout } from './components/breakout.js'
import { MOVEMENT_PERIOD, EVOLUTION_PERIOD } from './constants.js'
import { DEFAULT_GAME_STATE } from './game_state.js'

import { onKeyDown } from './events/key_down.js'
import { onKeyUp } from './events/key_up.js'
import { movePaddle } from './events/move_paddle.js'
import { moveBall } from './events/move_ball.js'
import { evolve } from './events/evolve.js'
import { Renderer } from '../../common/rendering/renderer.js'

const eventLoop = new EventLoop()

/**
 * @param {TRouter.IRouterState} state
 */
export function index({ path, description }) {
  eventLoop.clear()

  /** @type {DictSubject<import('./game_state.js').IGameState>} */
  const subject$ = new DictSubject({
    ...DEFAULT_GAME_STATE,
    eventLoop
  })

  eventLoop.add(() => movePaddle(subject$), MOVEMENT_PERIOD)
  eventLoop.add(() => moveBall(subject$), MOVEMENT_PERIOD)
  eventLoop.add(() => evolve(subject$), EVOLUTION_PERIOD)

  return c('div', { class: 'page playground-breakout-page' },
    c(sectionTitle, { text: description, path }),
    c('p', { text: 'This is a variant of the classic Breakout game where the bricks follow a stochastic evolution pattern.' }),
    c('p', { text: 'The space bar toggles pause mode and the arrow keys move the paddle.' }),

    c(aspectRatioBox, {
      ratio: 4 / 3,
      bottomMargin: 21 /* 1.5rem */,
      minHeight: 250,
      maxHeight: 600,
      item: c(breakout, subject$)
    })
  )
}

{
  /** @type {TObservables.ISubscription | undefined} */
  let keyDownSubscription
  /** @type {TObservables.ISubscription | undefined} */
  let keyUpSubscription

  dispatcher.events.create.subscribe({
    /** @param {Renderer<HTMLElement>} renderer */
    next(renderer) {
      if (renderer.component.type === breakout) {
        keyDownSubscription = keyDown$.subscribe(function(key) {
          onKeyDown(renderer.component.stateSource, key)
        })

        keyUpSubscription = keyUp$.subscribe(function(key) {
          onKeyUp(renderer.component.stateSource, key)
        })
      }
    }
  })

  dispatcher.events.destroy.subscribe({
    /** @param {Renderer<HTMLElement>} renderer */
    next(renderer) {
      if (renderer.component.type === breakout) {
        if (keyDownSubscription !== undefined) {
          keyDownSubscription.unsubscribe()
          keyDownSubscription = undefined
        }

        if (keyUpSubscription !== undefined) {
          keyUpSubscription.unsubscribe()
          keyUpSubscription = undefined
        }

        eventLoop.clear()
      }
    }
  })
}
