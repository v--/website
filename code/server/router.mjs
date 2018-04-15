import { NotFoundError } from '../common/errors'
import router from '../common/router'

import Response from './http/response'

export default async function serverRouter(db, path) {
    if (path.segments[0] === 'api') {
        if (path.segments[1] === 'pacman')
            return Response.json(await db.retrieve('pacman'))

        if (path.segments[1] === 'files')
            try {
                return Response.json(await db.retrieve(path.raw.substr('/api/'.length)))
            } catch (e) {
                if (!(e instanceof NotFoundError))
                    throw e
            }

        return Response.json({ error: '404 not found' }, 404)
    }

    return await Response.view(await router(db, path))
}
