import { c } from '../component'

import icon from '../components/icon'

export default function interactiveWarning ({ path }) {
  return c('div', { class: 'page interactive-warning-page' },
    c('br'),
    c(icon, { class: 'chart-arc', name: 'chart-arc' }),
    c('h1', { text: 'This page is interactive' }),
    c('p', {
      text: `${path.underCooked} features interactive content that will not work without a modern JavaScript interpreter.`
    }),
    c('em', {
      text: 'Note: This warning is rendered by the server. It sometimes takes time for the client code to kick in.'
    })
  )
}
