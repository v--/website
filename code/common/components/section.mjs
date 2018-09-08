import { c } from '../rendering/component'

export default function section ({ title }, children) {
  return c('div', { class: 'section' },
    c('h1', { class: 'section-title', text: title }),
    ...children
  )
}
