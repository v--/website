import { CoolError } from '../errors.mjs'
import { c } from '../rendering/component.mjs'

import markdown from '../components/markdown.mjs'
import icon from '../components/icon.mjs'

export default function error ({ data: err }) {
  const title = CoolError.isDisplayable(err) ? err.message : 'Error'

  return c('div', { class: 'page error-page' },
    c('br'),
    c(icon, { class: 'alert', name: 'alert' }),
    c('h1', { text: title }),
    c(markdown, {
      text: 'Please try refreshing the browser or [reporting a bug](mailto:ianis@ivasilev.net).'
    })
  )
}
