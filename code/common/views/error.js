import { PresentableError } from '../errors.js'
import { c } from '../rendering/component.js'

import { icon } from '../components/icon.js'
import { anchor } from '../components/anchor.js'

/**
 * @param {TRouter.IRouterState} state
 */
export function error({ data: err }) {
  return c('div', { class: 'page error-page' },
    c('br'),
    c(icon, { class: 'alert', name: 'alert' }),
    c('h1', {
      class: 'h1 error-title',
      text: err instanceof PresentableError ? err.title : 'Error'
    }),
    c('h3', {
      class: 'h3',
      text: err instanceof PresentableError ? err.message : 'An error has occurred' }
    ),
    c('p', undefined,
      c('span', { text: 'Please try refreshing the browser or ' }),
      c(anchor, { text: 'reporting a bug', href: 'mailto:ianis@ivasilev.net' })
    )
  )
}
