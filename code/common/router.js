const { splitURL } = require('common/support/strtools')
const { NotFoundError } = require('common/errors')
const RouterState = require('common/support/router_state')

const home = require('common/views/home')
const files = require('common/views/files')
const playground = require('common/views/playground')
const pacman = require('common/views/pacman')

async function routerImpl(db, route, subroute) {
    if (subroute === '') {
        switch (route) {
        case '':
            return { factory: home }

        case 'playground':
            return { factory: playground }

        case 'pacman':
            return {
                data: await db.retrieve('pacman'),
                factory: pacman
            }
        }
    }

    if (route === 'files') {
        const id = subroute ? `files/${subroute.replace(/\/$/, '')}` : 'files'
        const data = await db.retrieve(id)

        return {
            id, data,
            title: `index of /${id}`,
            factory: files
        }
    }

    throw new NotFoundError()
}

module.exports = async function router(db, url) {
    const { route, subroute } = splitURL(url)
    const rawState = await routerImpl(db, route, subroute)
    return new RouterState(Object.assign({ route, subroute }, rawState))
}
