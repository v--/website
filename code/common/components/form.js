import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

function buildDict (form) {
  const dict = {}
  const nodes = [form]

  for (const node of nodes) {
    if (node.name) {
      dict[node.name] = node.value
    }

    nodes.push(...node.children)
  }

  return dict
}

export function form ({ callback, class: className }, children) {
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
