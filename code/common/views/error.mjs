import { HTTPError } from '../errors'
import { c } from '../component'

import markdown from '../components/markdown'
import icon from '../components/icon'

export default function error({ data: err }) {
    const title = err instanceof HTTPError ? err.message : 'Error'

    return c('div', { class: 'page error-page' },
        c('br'),
        c(icon, { class: 'alert', name: 'alert' }),
        c('h1', { text: title }),
        c(markdown, {
            text: 'Please try refreshing the browser or [reporting a bug](mailto:ianis@ivasilev.net).'
        })
    )
}
