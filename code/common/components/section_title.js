import { c } from '../rendering/component.js'

import { link } from './link.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'

export function sectionTitle ({ text, class: className, path = null }) {
  return c('h1', { class: classlist('section-title', 'h1', className) },
    path !== null && c(link, { link: path.getParentPath().cooked, isInternal: true, title: 'Go one level up', class: 'up-link' },
      c(icon, { name: 'upload' })
    ),
    c('span', { text, title: text })
  )
}
