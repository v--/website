import { c } from '../component'

export default function section ({ title }, children) {
  return c('div', { class: 'section' },
    c('h1', { text: title }),
    ...children
  )
}
