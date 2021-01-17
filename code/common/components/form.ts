import { c, Component } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { SubmitEvent } from '../types/events.js'

function buildDict(form: HTMLFormElement) {
  const dict: Record<string, string> = {}
  const nodes: Element[] = [form]

  for (const node of nodes) {
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      dict[node.name] = node.value
    }

    for (let i = 0; i < node.children.length; i++) {
      nodes.push(node.children[i])
    }
  }

  return dict
}

export function form<T extends object>({
  callback,
  class: className
}: {
  callback: Action<T>
  class: string
}, children: Component[]) {
  return c('div', { class: classlist(className, 'form-container') },
    c('form', {
      submit(event: SubmitEvent) {
        const dict = buildDict(event.target)
        callback(dict as T)
        event.preventDefault()
      }
    }, ...children)
  )
}
