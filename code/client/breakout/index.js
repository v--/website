import { c } from '../../common/rendering/component.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { dispatcher } from '../core/render_dispatcher.js'
import { EventLoop } from '../core/support/event_loop.js'
import { keyDown$, keyUp$ } from '../core/shared_observables.js'

import { breakout } from './components/breakout.js'
import { GameStatus } from './enums/game_status.js'
import { MOVEMENT_PERIOD, EVOLUTION_PERIOD } from './constants.js'
import { DEFAULT_GAME_STATE } from './game_state.js'

import { onKeyDown } from './events/key_down.js'
import { onKeyUp } from './events/key_up.js'
import { movePaddle } from './events/move_paddle.js'
import { moveBall } from './events/move_ball.js'
import { evolve } from './events/evolve.js'

let eventLoop = null

export function index ({ path, description }) {
  const subject = new DictSubject(DEFAULT_GAME_STATE)
  const eventLoopListeners = new Map([
    [movePaddle.bind(null, subject), MOVEMENT_PERIOD],
    [moveBall.bind(null, subject), MOVEMENT_PERIOD],
    [evolve.bind(null, subject), EVOLUTION_PERIOD]
  ])

  eventLoop = new EventLoop(eventLoopListeners)

  subject.update({
    status: GameStatus.UNSTARTED,
    eventLoop: eventLoop
  })

  return c('div', { class: 'page playground-breakout-page' },
    c(sectionTitle, { text: description, path }),
    c('p', { text: 'This is a variant of the classic Breakout game where the bricks follow a stochastic evolution pattern.' }),
    c('p', { text: 'The space bar toggles pause mode and the arrow keys move the paddle.' }),

    c(aspectRatioBox, {
      ratio: 4 / 3,
      bottomMargin: 21 /* 1.5rem */,
      minHeight: 250,
      maxHeight: 550,
      item: c(breakout, subject)
    })
  )
}

{
  let keyDownSubscription = null
  let keyUpSubscription = null

  dispatcher.events.create.subscribe({
    next (node) {
      if (node.component.type === breakout) {
        keyDownSubscription = keyDown$.subscribe(function (key) {
          onKeyDown(node.component.stateSource, key)
        })

        keyUpSubscription = keyUp$.subscribe(function (key) {
          onKeyUp(node.component.stateSource, key)
        })
      }
    }
  })

  dispatcher.events.destroy.subscribe({
    next (node) {
      if (node.component.type === breakout) {
        if (keyDownSubscription !== null) {
          keyDownSubscription.unsubscribe()
          keyDownSubscription = null
        }

        if (keyUpSubscription !== null) {
          keyUpSubscription.unsubscribe()
          keyUpSubscription = null
        }

        if (eventLoop !== null) {
          eventLoop.stop()
        }
      }
    }
  })
}
