import { c } from '../rendering/component.mjs'

import icon from '../components/icon.mjs'

export default function interactivePlaceholder ({ path, loading }) {
  return c('div', { class: 'page interactive-placeholder-page' },
    c('br'),
    c(icon, { class: 'chart-arc', name: 'chart-arc' }),
    c('h1', { text: 'This page is interactive' }),
    c('p', {
      text: `${path.underCooked} features interactive content that will not work without a modern JavaScript interpreter.`
    })
  )
}
