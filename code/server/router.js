const { join } = require('path')

const { NotFoundError } = require('common/errors')
const URL = require('common/support/url')

const ResponseContext = require('server/http/response_context')

const home = require('common/views/home')

module.exports = async function router(requestUrl) {
    const publicFile = await ResponseContext.forFile(join('public', requestUrl))

    if (publicFile)
        return publicFile

    const url = new URL(requestUrl)

    if (url.route === '' && url.subroute === '')
        return await ResponseContext.forView(home)

    if (url.route === 'api' && url.subroute === 'icons')
        return await ResponseContext.forFile('public/icons.json')

    throw new NotFoundError()
}
