import { c } from '../rendering/component.js'

import { link } from './link.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'

function getParentPathWithinSection (path) {
  if (path.segments.length === 1) {
    return path
  }

  return path.getParentPath()
}

export function sectionTitle ({ text, class: className, path = null }) {
  return c('h1', { class: classlist('section-title', className) },
    path !== null && c(link, { link: getParentPathWithinSection(path).cooked, isInternal: true, title: 'Go one level up' },
      c(icon, { name: 'chevron-up' })
    ),
    c('span', { text, title: text })
  )
}
