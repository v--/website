const { c } = require('common/component')

const body = require('common/components/body')
const title = require('common/components/title')

module.exports = function index({ state, favicon }) {
    const serializedData = JSON.stringify({
        id: state.id,
        data: state.data
    })

    return c('html', { lang: 'en-US' },
        c('head', null,
            c('head', null,
                c(title, state),
                c('meta', { charset: 'UTF-8' }),
                c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
                c('link', { rel: 'shortcut icon', type: 'image/x-icon', href: `data:image/png;base64,${favicon}` }),
                c('link', { rel: 'stylesheet', href: 'styles/index.css' }),
                c('script', { id: 'data', type: 'application/json', text: serializedData }),
                c('script', { src: 'code/core.js' })
            ),
            c(body, state)
        )
    )
}
