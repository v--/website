const { splitURL } = require('common/support/strtools')
const RouterState = require('common/support/router_state')

const home = require('common/views/home')
const files = require('common/views/files')
const playground = require('common/views/playground')
const pacman = require('common/views/pacman')
const error = require('common/views/error')

async function routerImpl(db, route, subroute) {
    if (subroute === '') {
        switch (route) {
        case '':
            return { factory: home }

        case 'files':
            return { factory: files }

        case 'playground':
            return { factory: playground }

        case 'pacman':
            return {
                data: await db.retrieve('pacman'),
                factory: pacman
            }
        }
    }

    throw { factory: error }
}

module.exports = async function router(db, url) {
    const { route, subroute } = splitURL(url)
    const rawState = await routerImpl(db, route, subroute)
    return new RouterState(Object.assign({ route, subroute }, rawState))
}
