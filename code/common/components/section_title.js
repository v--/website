import { c } from '../rendering/component.js'

import { anchor } from './anchor.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'
import { Path } from '../support/path.js'

/**
 * @param {{
 *   text: string,
 *   class?: string,
 *   path?: Path
 * }} state
 */
export function sectionTitle({
  text,
  class: className,
  path
}) {
  return c('h1', { class: classlist('section-title', 'h1', className) },
    path && c(anchor, { href: path.getParentPath().cooked, isInternal: true, title: 'Go one level up', class: 'up-link' },
      c(icon, { name: 'upload' })
    ),
    c('span', { class: 'section-title-text', text, title: text })
  )
}
