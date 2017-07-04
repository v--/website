const { join } = require('path')

const { NotFoundError } = require('common/errors')
const { c } = require('common/component')
const { startsWith } = require('common/support/strtools')
const router = require('common/router')

const body = require('common/components/body')
const title = require('common/components/title')

const Response = require('server/http/response')
const { stat } = require('server/support/fs')

function index(state) {
    const serializedData = JSON.stringify({
        route: state.route,
        data: state.data
    })

    return c('html', { lang: 'en-US' },
        c('head', null,
            c('head', null,
                c(title, state),
                c('meta', { charset: 'UTF-8' }),
                c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
                c('link', { rel: 'icon', href: 'images/favicon.png' }),
                c('link', { rel: 'stylesheet', href: 'styles/index.css' }),
                c('script', { id: 'data', type: 'application/json', text: serializedData }),
                c('script', { src: 'code/core.js' })
            ),
            c(body, state)
        )
    )
}

module.exports = async function serverRouter(db, url) {
    if (startsWith(url, '/api/')) {
        switch (url) {
        case '/api/pacman':
            return Response.json(await db.retrieve('pacman'))

        case '/api/files':
            return Response.json(await db.retrieve('files'))

        default:
            return Response.json({}, 404)
        }
    }

    const publicPath = join('public', url)

    try {
        if ((await stat(publicPath)).isFile())
            return Response.file(publicPath)
    } catch (e) {
        if (e.code !== 'ENOENT')
            throw e
    }

    try {
        return await Response.view(c(index, await router(db, url)))
    } catch (e) {
        if (e instanceof NotFoundError)
            return null
        else
            throw e
    }
}
