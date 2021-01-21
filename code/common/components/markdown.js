import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { parseMarkdown } from '../support/markdown/parser.js'
import { buildComponentTree } from '../support/markdown/component_builder.js'

/**
 * @param {{ source: string, class?: string }} state
 */
export function markdown({ source, class: className }) {
  return c('article', { class: classlist(className, 'markdown') },
    buildComponentTree(parseMarkdown(source))
  )
}
