const Interface = require('common/support/interface')
const { NotFoundError } = require('common/errors')
const { splitURL } = require('common/support/strtools')

const home = require('common/views/home')
const files = require('common/views/files')
const playground = require('common/views/playground')
const pacman = require('common/views/pacman')

async function routerImpl(db, route, subroute) {
    if (subroute === '') {
        switch (route) {
        case '':
            return {
                title: 'home',
                factory: home
            }

        case 'files':
            return {
                title: 'files',
                factory: files
            }

        case 'playground':
            return {
                title: 'playground',
                factory: playground
            }

        case 'pacman':
            return {
                title: 'pacman',
                factory: pacman,
                data: await db.pacman()
            }
        }
    }

    throw new NotFoundError()
}

const IState = Interface.create({ title: Interface.IString, factory: Interface.IFunction })

module.exports = async function router(db, url) {
    const { route, subroute } = splitURL(url)
    const { title, factory, data = null } = IState.assert(await routerImpl(db, route, subroute))
    return { route, subroute, title, factory, data }
}
