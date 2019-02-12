import { c } from '../rendering/component.mjs'
import { classlist } from '../../common/support/dom_properties.mjs'

function buildDict (form) {
  const dict = {}
  const nodes = [form]

  for (const node of nodes) {
    if (node.name) {
      dict[node.name] = node.value
    }

    Array.prototype.push.apply(nodes, node.children)
  }

  return dict
}

export default function form ({ callback, class: className }, children) {
  return c('div', { class: classlist(className, 'form-container') },
    c('form', {
      submit (event) {
        const dict = buildDict(event.target)
        callback(dict)
        event.preventDefault()
      }
    }, ...children)
  )
}
