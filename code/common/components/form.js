import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

/**
 * @param {HTMLFormElement} form
 */
function buildDict(form) {
  /** @type {Record<string, string>} */
  const dict = {}

  /** @type {Element[]} */
  const nodes = [form]

  for (const node of nodes) {
    // This check is only run interactively anyway
    // eslint-disable-next-line no-undef
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      dict[node.name] = node.value
    }

    for (let i = 0; i < node.children.length; i++) {
      nodes.push(node.children[i])
    }
  }

  return dict
}

/**
 * @param {{ callback: TCons.Action<any>, class: string }} param1
 * @param {TComponents.IComponent[]} children
 */
export function form({ callback, class: className }, children) {
  return c('div', { class: classlist(className, 'form-container') },
    c('form', {
      /**
       * @param {TEvents.SubmitEvent} event
       */
      submit(event) {
        const dict = buildDict(event.target)
        callback(dict)
        event.preventDefault()
      }
    }, ...children)
  )
}
