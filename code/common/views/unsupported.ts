import { c } from '../rendering/component.js'

import { icon } from '../components/icon.js'
import { RouterState } from '../support/router_state.js'

export function unsupported({ path }: RouterState) {
  return c('div', { class: 'page unsupported-page' },
    c('br'),
    c(icon, { class: 'chart-arc', name: 'chart-arc' }),
    c('h1', { class: 'h1', text: 'Incompatible browser' }),
    c('p', {
      text: `${path.underCooked} requires a browser with an enabled modern JavaScript interpreter.`
    })
  )
}
