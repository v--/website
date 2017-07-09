const { join } = require('path')

const { NotFoundError } = require('common/errors')
const { startsWith } = require('common/support/strings')
const router = require('common/router')

const Response = require('server/http/response')
const { stat } = require('server/support/fs')

module.exports = async function serverRouter(db, url) {
    if (startsWith(url, '/api/')) {
        if (url === '/api/pacman')
            return Response.json(await db.retrieve('pacman'))

        if (startsWith(url, '/api/files'))
            try {
                return Response.json(await db.retrieve(url.substr('/api/'.length)))
            } catch (e) {
                if (!(e instanceof NotFoundError))
                    throw e
            }

        return Response.json({ error: '404 not found' }, 404)
    }

    const publicPath = join('public', url)

    try {
        if ((await stat(publicPath)).isFile())
            return Response.file(publicPath)
    } catch (e) {
        if (e.code !== 'ENOENT')
            throw e
    }

    return await Response.view(await router(db, url))
}
