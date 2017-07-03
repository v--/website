const { join } = require('path')

const { splitURL } = require('common/support/strtools')
const router = require('common/router')
const head = require('common/components/head')
const body = require('common/components/body')
const { c } = require('common/component')

const StringBufferStream = require('server/support/string_buffer_stream')
const ResponseContext = require('server/http/response_context')
const render = require('server/render')
const db = require('server/db')

function *renderHTML(head, body) {
    yield '<!DOCTYPE html>'
    yield '<html lang="en-US">'
    yield *render(head)
    yield *render(body)
    yield '</html>'
}

module.exports = async function serverRouter(url) {
    const publicFile = await ResponseContext.forFile(join('public', url))
    const parsedURL = splitURL(url)

    if (publicFile)
        return publicFile

    const headComponent = c(head, parsedURL)
    const bodyComponent = c(body, parsedURL, await router(db, parsedURL))

    return new ResponseContext(
        new StringBufferStream(renderHTML(headComponent, bodyComponent)),
        null,
        'text/html'
    )
}
