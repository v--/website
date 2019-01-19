import { CoolError } from '../errors.mjs'
import { c } from '../rendering/component.mjs'

import icon from '../components/icon.mjs'
import link from '../components/link.mjs'

export default function error ({ data: err }) {
  const title = CoolError.isDisplayable(err) ? err.message : 'Error'

  return c('div', { class: 'page error-page' },
    c('br'),
    c(icon, { class: 'alert', name: 'alert' }),
    c('h1', { text: title }),
    c('p', null,
      c('span', 'Please try refreshing the browser or '),
      c(link, { text: 'reporting a bug', link: 'mailto:ianis@ivasilev.net.' })
    )
  )
}
