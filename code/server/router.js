const { join } = require('path')

const router = require('common/router')
const { c } = require('common/component')

const body = require('common/components/body')
const title = require('common/components/title')

const StringBufferStream = require('server/support/string_buffer_stream')
const ResponseContext = require('server/http/response_context')
const render = require('server/render')
const db = require('server/db')

function *renderHTML(state) {
    yield '<!DOCTYPE html>'
    yield '<html lang="en-US">'

    yield *render(c('head', null,
        c(title, state),
        c('meta', { charset: 'UTF-8' }),
        c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
        c('link', { rel: 'icon', href: 'images/favicon.png' }),
        c('link', { rel: 'stylesheet', href: 'styles/index.css' }),
        c('script', { src: 'code/core.js' })
    ))

    yield *render(c(body, state))
    yield '</html>'
}

module.exports = async function serverRouter(url) {
    const publicFile = await ResponseContext.forFile(join('public', url))

    if (publicFile)
        return publicFile

    const state = await router(db, url)

    return new ResponseContext(
        new StringBufferStream(renderHTML(Object.assign({ redirect() {} }, state))),
        null,
        'text/html'
    )
}
