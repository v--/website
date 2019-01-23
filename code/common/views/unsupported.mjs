import { c } from '../rendering/component.mjs'

import icon from '../components/icon.mjs'

export default function unsupported ({ path, loading }) {
  return c('div', { class: 'page unsupported-page' },
    c('br'),
    c(icon, { class: 'chart-arc', name: 'chart-arc' }),
    c('h1', { text: 'Incompatible browser' }),
    c('p', {
      text: `${path.underCooked} requires a browser with an enabled modern JavaScript interpreter.`
    })
  )
}
