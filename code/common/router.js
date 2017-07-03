const { Observable } = require('common/support/observation')
const { NotFoundError } = require('common/errors')
const { c } = require('common/component')

const home = require('common/views/home')
const pacman = require('common/views/pacman')

module.exports = async function router(db, { route, subroute }) {
    switch (route) {
    case '':
        if (subroute === '')
            return c(home)

        break
    case 'pacman':
        if (subroute === '')
            return c(pacman, new Observable({ route, subroute, data: await db.pacman() }))

        break
    }

    throw new NotFoundError()
}
