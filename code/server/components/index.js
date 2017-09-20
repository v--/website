const { c } = require('common/component')

const nojs = require('common/components/nojs')
const main = require('common/components/main')
const title = require('common/components/title')

module.exports = function index({ state }) {
    let serializedData

    if (state.data instanceof Error)
        serializedData = JSON.stringify({
            id: state.id,
            error: state.data,
            errorCls: state.data.constructor.name
        })
    else
        serializedData = JSON.stringify({
            id: state.id,
            data: state.data
        })

    return c('html', { lang: 'en-US' },
        c('head', null,
            c('head', null,
                c(title, state),
                c('meta', { charset: 'UTF-8' }),
                c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
                c('base', { href: '/' }),
                c('link', { rel: 'shortcut icon', type: 'image/x-icon', href: 'images/favicon.png' }),
                c('link', { rel: 'stylesheet', href: 'styles/index.css' }),
                c('script', { id: 'data', type: 'application/json', text: serializedData }),
                c('script', { src: 'code/core.js' }),
                c('script', { src: 'code/compatibility.js' }),
            ),

            c('body', null,
                c(nojs, state),
                c(main, state)
            )
        )
    )
}
