import router from '../common/router.mjs'
import { NotFoundError } from '../common/errors.mjs'

import Response from './http/response.mjs'

export default async function serverRouter (path, db) {
  if (path.segments[0] === 'api') {
    if (path.segments.length === 2 && path.segments[1] === 'pacman') {
      return Response.json(await db.collections.pacmanPackages.load())
    }

    if (path.segments[1] === 'files') {
      try {
        const directory = path.segments.slice(2).join('/')
        return Response.json(await db.collections.files.readDirectory(directory))
      } catch (e) {
        if (!(e instanceof NotFoundError)) {
          throw e
        }
      }
    }

    return Response.json({ error: '404 not found' }, 404)
  }

  return Response.view(await router(path, db))
}
