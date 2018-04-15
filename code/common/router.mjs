import { NotFoundError } from './errors'
import RouterState from './support/router_state'

import home from './views/home'
import files from './views/files'
import playground from './views/playground'
import pacman from './views/pacman'

async function routerImpl(db, path) {
    if (path.segments.length === 0)
        return {
            id: 'home',
            factory: home
        }

    if (path.segments.length === 1)
        switch (path.segments[0]) {
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

    if (path.segments[0] === 'files') {
        const subroute = path.segments.slice(1).join('/')
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

export default async function router(db, path) {
    const rawState = await routerImpl(db, path)
    return new RouterState(Object.assign({ path }, rawState))
}
