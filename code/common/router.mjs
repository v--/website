import { NotFoundError } from './errors'
import RouterState from './support/router_state'

import home from './views/home'
import files from './views/files'
import playground from './views/playground'
import pacman from './views/pacman'

async function routerImpl (path, db) {
  if (path.segments.length === 0) {
    return {
      id: 'home',
      factory: home
    }
  }

  if (path.segments.length === 1) {
    switch (path.segments[0]) {
      case 'playground':
        return {
          id: 'playground',
          factory: playground
        }

      case 'pacman':
        return {
          id: 'pacman',
          data: await db.collections.pacmanPackages.load(),
          dataURL: '/api/pacman',
          factory: pacman
        }
    }
  }

  if (path.segments[0] === 'files') {
    return {
      id: path.segments.join('/'),
      data: await db.collections.files.readDirectory(path.segments.slice(1).join('/')),
      dataURL: `/api${path.cooked}`,
      title: `index of ${path.cooked}`,
      factory: files
    }
  }

  throw new NotFoundError()
}

export default async function router (path, db) {
  const rawState = await routerImpl(path, db)
  return new RouterState(Object.assign({ path }, rawState))
}
