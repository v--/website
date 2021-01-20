import { CoolError } from '../errors.js'
import { c } from '../rendering/component.js'

import { icon } from '../components/icon.js'
import { link } from '../components/link.js'

/**
 * @param {TRouter.IRouterState} state
 */
export function error({ data: err }) {
  const title = err instanceof Error && CoolError.isDisplayable(err) ? err.message : 'Error'

  return c('div', { class: 'page error-page' },
    c('br'),
    c(icon, { class: 'alert', name: 'alert' }),
    c('h1', { class: 'h1', text: title }),
    c('p', undefined,
      c('span', { text: 'Please try refreshing the browser or ' }),
      c(link, { text: 'reporting a bug', link: 'mailto:ianis@ivasilev.net.' })
    )
  )
}
