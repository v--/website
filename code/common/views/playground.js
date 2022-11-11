import { c } from '../rendering/component.js'
import { PAGE_DESCRIPTIONS } from '../constants/page_descriptions.js'

import { anchor } from '../components/anchor.js'
import { sectionTitle } from '../components/section_title.js'

export function playground() {
  return c('div', { class: 'page playground-page' },
    c('div', undefined,
      c(sectionTitle, { text: '/playground' }),
      c('p', { text: "These are some of the browser-based visualizations and simulations I have created. The code is neither minified nor bundled and can be easily explored using any browser's developer tools." }),
      c('dl', { class: 'cool-list' },
        c('dt', undefined,
          c(anchor, {
            href: '/playground/breakout',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.breakout }),

        c('dt', undefined,
          c(anchor, {
            href: '/playground/fleeing_button',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.fleeing_button })
      )
    )
  )
}
