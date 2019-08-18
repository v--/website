import { NotFoundError } from './errors.js'
import SidebarID from './enums/sidebar_id.js'
import RouterState from './support/router_state.js'

import home from './views/home.js'
import files from './views/files.js'
import pacman from './views/pacman.js'
import playground from './views/playground.js'

async function routerImpl (path, store) {
  if (path.segments.length === 0) {
    return {
      title: 'home',
      factory: home,
      sidebarID: SidebarID.HOME
    }
  }

  switch (path.segments[0]) {
    case 'files':
      return {
        title: `index of ${path.underCooked}`,
        factory: files,
        data: await store.collections.files.readDirectory(path.segments.slice(1).join('/')),
        sidebarID: SidebarID.FILES
      }

    case 'pacman':
      if (path.segments.length > 1) {
        throw new NotFoundError()
      }

      return {
        title: 'pacman',
        factory: pacman,
        data: await store.collections.pacmanPackages.load(),
        sidebarID: SidebarID.PACMAN
      }

    case 'playground':
      if (path.segments.length === 1) {
        return {
          title: 'playground',
          factory: playground,
          sidebarID: SidebarID.PLAYGROUND
        }
      } else if (path.segments.length === 2) {
        switch (path.segments[1]) {
          case 'sorting':
            return {
              title: 'sorting | playground',
              factory: 'sorting',
              sidebarID: SidebarID.PLAYGROUND
            }

          case 'curve_fitting':
            return {
              title: 'curve fitting | playground',
              factory: 'curve_fitting',
              sidebarID: SidebarID.PLAYGROUND
            }

          case 'resolution':
            return {
              title: 'resolution | playground',
              factory: 'resolution',
              sidebarID: SidebarID.PLAYGROUND
            }

          case 'breakout':
            return {
              title: 'breakout | playground',
              factory: 'breakout',
              sidebarID: SidebarID.PLAYGROUND
            }
        }
      }
  }

  throw new NotFoundError()
}

export default async function router (path, store) {
  const rawState = await routerImpl(path, store)
  return new RouterState(Object.assign({ path }, rawState))
}
