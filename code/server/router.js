const { NotFoundError } = require('common/errors')
const { startsWith } = require('common/support/strings')
const router = require('common/router')

const Response = require('server/http/response')

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

    return await Response.view(await router(db, url))
}
