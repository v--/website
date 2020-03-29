import { router } from '../common/router.js'
import { NotFoundError } from '../common/errors.js'

import { Response } from './http/response.js'

export async function serverRouter (path, store) {
  if (path.segments[0] === 'api') {
    if (path.segments.length === 2 && path.segments[1] === 'pacman') {
      return Response.json(await store.collections.pacmanPackages.load())
    }

    if (path.segments[1] === 'files' || path.segments[1] === 'gallery') {
      try {
        const directory = path.segments.slice(2).join('/')
        return Response.json(await store.collections[path.segments[1]].readDirectory(directory))
      } catch (e) {
        if (!(e instanceof NotFoundError)) {
          throw e
        }
      }
    }

    return Response.json({ error: '404 not found' }, 404)
  }

  return Response.view(await router(path, store))
}
