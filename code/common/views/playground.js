import { c } from '../rendering/component.js'
import { PAGE_DESCRIPTIONS } from '../constants/page_descriptions.js'

import { link } from '../components/link.js'
import { sectionTitle } from '../components/section_title.js'

export function playground() {
  return c('div', { class: 'page playground-page' },
    c('div', undefined,
      c(sectionTitle, { text: '/playground' }),
      c('p', { text: "These are some of the browser-based visualizations and simulations I have created. The code is neither precompiled nor bundled and can be easily explored using any browser's developer tools." }),
      c('dl', { class: 'cool-list' },
        c('dt', undefined,
          c(link, {
            link: '/playground/sorting',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.sorting }),

        c('dt', undefined,
          c(link, {
            link: '/playground/curve_fitting',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.curve_fitting }),

        c('dt', undefined,
          c(link, {
            link: '/playground/resolution',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.resolution }),

        c('dt', undefined,
          c(link, {
            link: '/playground/breakout',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.breakout }),

        c('dt', undefined,
          c(link, {
            link: '/playground/graphs',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.graphs }),

        c('dt', undefined,
          c(link, {
            link: '/playground/fleeing_button',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.fleeing_button }),

        c('dt', undefined,
          c(link, {
            link: '/playground/motifs',
            isInternal: true
          })
        ),
        c('dd', { text: PAGE_DESCRIPTIONS.playground.motifs })
      )
    )
  )
}
