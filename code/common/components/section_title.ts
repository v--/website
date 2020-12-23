import { c } from '../rendering/component.js'

import { link } from './link.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'
import { Path } from '../support/path.js'

export function sectionTitle({
  text,
  class: className,
  path
} : {
  text: string,
  class?: string,
  path?: Path
}) {
  return c('h1', { class: classlist('section-title', 'h1', className) },
    path && c(link, { link: path.getParentPath().cooked, isInternal: true, title: 'Go one level up', class: 'up-link' },
      c(icon, { name: 'upload' })
    ),
    c('span', { class: 'section-title-text', text, title: text })
  )
}
