import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import { createKeyDownSubject, createKeyUpSubject } from '../core/support/dom.js'
import { dispatcher } from '../core/render_dispatcher.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { breakout } from './components/breakout.js'
import { GameStatus } from './enums/game_status.js'
import { MOVEMENT_PERIOD, EVOLUTION_PERIOD } from './constants.js'
import { DEFAULT_GAME_STATE } from './game_state.js'
import { EventLoop } from './event_loop.js'

import { onKeyDown } from './events/key_down.js'
import { onKeyUp } from './events/key_up.js'
import { movePaddle } from './events/move_paddle.js'
import { moveBall } from './events/move_ball.js'
import { evolve } from './events/evolve.js'

export function index () {
  const subject = new DictSubject(DEFAULT_GAME_STATE)
  const eventLoopListeners = new Map([
    [movePaddle.bind(null, subject), MOVEMENT_PERIOD],
    [moveBall.bind(null, subject), MOVEMENT_PERIOD],
    [evolve.bind(null, subject), EVOLUTION_PERIOD]
  ])

  subject.update({
    status: GameStatus.UNSTARTED,
    eventLoop: new EventLoop(eventLoopListeners)
  })

  return c(aspectRatioPage, { class: 'page playground-breakout-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'A Breakout variant with evolving bricks' }),
      c('p', { text: 'This is a variant of the classic Breakout game where the bricks follow a stochastic evolution pattern.' }),
      c('p', { text: 'The space bar toggles pause mode and the arrow keys move the paddle.' })
    ),

    c(aspectRatioBox, {
      ratio: 4 / 3,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 700,
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
        const keyDownSubject = createKeyDownSubject()
        keyDownSubscription = keyDownSubject.subscribe(function (key) {
          onKeyDown(node.component.stateSource, key)
        })

        const keyUpSubject = createKeyUpSubject()
        keyUpSubscription = keyUpSubject.subscribe(function (key) {
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
      }
    }
  })
}
