const { join } = require('path')

const { startsWith } = require('common/support/strtools')
const router = require('common/router')

const Response = require('server/http/response')
const { stat } = require('server/support/fs')

module.exports = async function serverRouter(db, url) {
    if (startsWith(url, '/api/')) {
        switch (url) {
        case '/api/pacman':
            return Response.json(await db.retrieve('pacman'))

        case '/api/files':
            return Response.json(await db.retrieve('files'))

        default:
            return Response.json({ error: '404 not found' }, 404)
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

    return await Response.view(await router(db, url))
}
