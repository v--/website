import { NotFoundError } from './errors'
import RouterState from './support/router_state'

import home from './views/home'
import files from './views/files'
import pacman from './views/pacman'
import playground from './views/playground'
import playgroundSorting from './views/playground/sorting'

async function routerImpl (path, db) {
  if (path.segments.length === 0) {
    return {
      id: 'home',
      factory: home
    }
  }

  switch (path.segments[0]) {
    case 'files':
      return {
        id: path.segments.join('/'),
        data: await db.collections.files.readDirectory(path.segments.slice(1).join('/')),
        dataURL: `/api${path.underCooked}`,
        title: `index of ${path.underCooked}`,
        factory: files
      }

    case 'pacman':
      if (path.segments.length > 1) {
        throw new NotFoundError()
      }

      return {
        id: 'pacman',
        data: await db.collections.pacmanPackages.load(),
        dataURL: '/api/pacman',
        factory: pacman
      }

    case 'playground':
      if (path.segments.length === 1) {
        return {
          id: 'playground',
          factory: playground
        }
      }

      if (path.segments.length === 2) {
        switch (path.segments[1]) {
          case 'sorting':
            return {
              id: 'playground/sorting',
              title: 'sorting | playground',
              factory: playgroundSorting
            }
        }
      }
  }

  throw new NotFoundError()
}

export default async function router (path, db) {
  const rawState = await routerImpl(path, db)
  return new RouterState(Object.assign({ path }, rawState))
}
