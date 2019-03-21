import { c } from '../rendering/component.mjs'
import { classlist } from '../support/dom_properties.mjs'
import { parseMarkdown } from '../support/markdown/parser.mjs'
import { buildComponentTree } from '../support/markdown/component_builder.mjs'

export default function markdown ({ source, class: className }) {
  return c('div', { class: classlist(className, 'markdown') },
    buildComponentTree(parseMarkdown(source))
  )
}
