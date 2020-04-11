import { c } from '../rendering/component.js'
import { PAGE_DESCRIPTIONS } from '../constants/page_descriptions.js'

import { link } from '../components/link.js'
import { sectionTitle } from '../components/section_title.js'

export function playground () {
  return c('div', { class: 'page playground-page' },
    c('div', null,
      c(sectionTitle, { text: '/playground' }),
      c('p', { text: "These are some of the browser-based visualizations and simulations I have created. The code is neither precompiled nor bundled and can be easily explored using any browser's developer tools." }),
      c('ul', { class: 'cool-list' },
        c('li', null,
          c(link, {
            class: 'playground-link',
            text: PAGE_DESCRIPTIONS.playground.sorting,
            link: 'playground/sorting',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: PAGE_DESCRIPTIONS.playground.curve_fitting,
            link: 'playground/curve_fitting',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: PAGE_DESCRIPTIONS.playground.resolution,
            link: 'playground/resolution',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: PAGE_DESCRIPTIONS.playground.breakout,
            link: 'playground/breakout',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: PAGE_DESCRIPTIONS.playground.graphs,
            link: 'playground/graphs',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: PAGE_DESCRIPTIONS.playground.fleeing_button,
            link: 'playground/fleeing_button',
            isInternal: true
          })
        )
      )
    )
  )
}
