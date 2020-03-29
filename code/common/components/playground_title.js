import { c } from '../rendering/component.js'

import { link } from './link.js'
import { icon } from './icon.js'

export function playgroundTitle ({ text }) {
  return c('h1', { class: 'section-title' },
    c(link, { link: '/playground', isInternal: true, title: 'Go to the playground' },
      c(icon, { name: 'chevron-up' })
    ),
    c('span', { text })
  )
}
