const { HTTPError } = require('common/errors')
const { c } = require('common/component')

const text = require('common/components/text')
const icon = require('common/components/icon')

module.exports = function error({ data: err }) {
    const title = err instanceof HTTPError ? err.message : 'Error'

    return c('main', { class: 'error-page' },
        c('br'),
        c(icon, { class: 'alert', name: 'alert' }),
        c('h1', { text: title }),
        c(text, {
            text: 'Please try refreshing the browser or [reporting a bug](mailto:ianis@ivasilev.net).'
        })
    )
}
