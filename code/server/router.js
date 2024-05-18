import { router } from '../common/router.js'
import { NotFoundError } from '../common/errors'
import { Path } from '../common/support/path.js'

import { Response } from './http/response.js'
import { WEBFINGER_ALIASES, WEBFINGER_LINKS } from './support/webfinger.js'

/**
 * @param {Path} path
 * @param {TStore.IStore} store
 */
export async function serverRouter(path, store) {
  if (path.segments[0] === 'api') {
    if (path.segments.length === 2 && path.segments[1] === 'pacman') {
      return Response.json(await store.collections.pacmanPackages.load())
    }

    if (path.segments[1] === 'files') {
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
  } else if (
    path.segments.length === 2 &&
    path.segments[0] === '.well-known' &&
    path.segments[1] === 'webfinger'
  ) {
    const resource = path.query.get('resource')

    if (resource && WEBFINGER_ALIASES.includes(resource)) {
      return Response.json({
        subject: resource,
        aliases: WEBFINGER_ALIASES.filter(alias => alias !== resource),
        links: WEBFINGER_LINKS
      })
    }
  }

  return Response.view(await router(path, store))
}
