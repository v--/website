import { splitURL } from './support/strings'
import { NotFoundError } from './errors'
import RouterState from './support/router_state'

import home from './views/home'
import files from './views/files'
import playground from './views/playground'
import pacman from './views/pacman'

async function routerImpl(db, route, subroute) {
    if (subroute === '')
        switch (route) {
        case '':
            return {
                id: 'home',
                factory: home
            }

        case 'playground':
            return {
                id: 'playground',
                factory: playground
            }

        case 'pacman':
            return {
                id: 'pacman',
                data: await db.retrieve('pacman'),
                factory: pacman
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

export default async function router(db, url) {
    const { route, subroute } = splitURL(url)
    const rawState = await routerImpl(db, route, subroute)
    return new RouterState(Object.assign({ route, subroute }, rawState))
}
