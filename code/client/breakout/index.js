import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'

import breakout from './components/breakout.js'

import { Observable } from '../../common/support/observable.js'

export default function playgroundBreakout () {
  const observable = new Observable()

  return c(aspectRatioPage, { class: 'page playground-breakout-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'A Breakout variant that fights back' }),
      c('p', { text: 'This is a variant of the classic Breakout game where the bricks follow a stochastic evolution pattern.' }),
      c('p', { text: 'The paddle can be moved using the keyboard arrows and the pause screen can be toggled using space bar.' })
    ),

    c(aspectRatioBox, {
      ratio: 4 / 3,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 500,
      item: c(breakout, observable)
    })
  )
}
