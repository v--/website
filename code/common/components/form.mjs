import { Observable } from '../support/observable.mjs'
import { c } from '../rendering/component.mjs'

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

export default function form ({ callback, validator }, children) {
  const errorLabelObservable = new Observable({
    class: 'form-error-label',
    text: ''
  })

  return c('div', { class: 'form-container' },
    c('form', {
      submit (event) {
        const dict = buildDict(event.target)
        const error = validator ? validator(dict) : ''

        if (error) {
          errorLabelObservable.update({ text: error })
        } else {
          errorLabelObservable.update({ text: '' })
          callback(dict)
        }

        event.preventDefault()
      }
    }, ...children),
    c('p', errorLabelObservable)
  )
}
