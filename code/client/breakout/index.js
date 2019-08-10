import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import { createKeyDownSubject, createKeyUpSubject } from '../core/support/dom.js'
import { createIntervalObservable } from '../core/support/timeout.js'
import dispatcher from '../core/render_dispatcher.js'
import DictSubject from '../../common/observables/dict_subject.js'

import breakout from './components/breakout.js'
import onKeyDown from './events/key_down.js'
import onKeyUp from './events/key_up.js'
import GameState from './enums/game_state.js'
import { EVENT_LOOP_PERIOD, DEFAULT_BALL_POSITION, DEFAULT_BALL_DIRECTION, DEFAULT_BRICKS } from './constants.js'

const subject = new DictSubject({
  eventLoop: createIntervalObservable(EVENT_LOOP_PERIOD),
  eventLoopSubscriptions: new Map(),

  paddleX: 0,
  bricks: DEFAULT_BRICKS,
  ball: DEFAULT_BALL_POSITION,
  direction: DEFAULT_BALL_DIRECTION,
  score: 0,
  state: GameState.UNSTARTED
})

let keyDownSubscription = null
let keyUpSubscription = null

dispatcher.events.create.subscribe({
  next (node) {
    if (node.component.type === playgroundBreakout) {
      const keyDownSubject = createKeyDownSubject()
      keyDownSubscription = keyDownSubject.subscribe(function (key) {
        onKeyDown(key, subject)
      })

      const keyUpSubject = createKeyUpSubject()
      keyUpSubscription = keyUpSubject.subscribe(function (key) {
        onKeyUp(key, subject)
      })
    }
  }
})

dispatcher.events.destroy.subscribe({
  next (node) {
    if (node.component.type === playgroundBreakout) {
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

export default function playgroundBreakout () {
  return c(aspectRatioPage, { class: 'page playground-breakout-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'A Breakout variant that fights back' }),
      c('p', { text: 'This is a variant of the classic Breakout game where the bricks follow a stochastic evolution pattern.' }),
      c('p', { text: 'The space bar toggles pause mode and the arrow keys move the paddle.' })
    ),

    c(aspectRatioBox, {
      ratio: 4 / 3,
      bottomMargin: 20,
      minHeight: 250,
      maxHeight: 700,
      item: c(breakout, subject)
    })
  )
}
