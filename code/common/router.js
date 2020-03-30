import { NotFoundError } from './errors.js'
import { SidebarId } from './enums/sidebar_id.js'
import { RouterState } from './support/router_state.js'

import { home } from './views/home.js'
import { files } from './views/files.js'
import { gallery } from './views/gallery.js'
import { pacman } from './views/pacman.js'
import { playground } from './views/playground.js'

async function routerImpl (path, store) {
  if (path.segments.length === 0) {
    return {
      title: 'home',
      factory: home,
      sidebarID: SidebarId.HOME
    }
  }

  switch (path.segments[0]) {
    case 'files':
      return {
        title: path.underCooked,
        factory: files,
        data: await store.collections.files.readDirectory(path.segments.slice(1).join('/')),
        sidebarID: SidebarId.FILES
      }

    case 'gallery':
      return {
        title: path.underCooked,
        factory: gallery,
        data: await store.collections.gallery.readDirectory(path.segments.slice(1).join('/')),
        sidebarID: SidebarId.GALLERY
      }

    case 'pacman':
      if (path.segments.length > 1) {
        throw new NotFoundError()
      }

      return {
        title: 'pacman',
        factory: pacman,
        data: await store.collections.pacmanPackages.load(),
        sidebarID: SidebarId.PACMAN
      }

    case 'playground':
      if (path.segments.length === 1) {
        return {
          title: 'playground',
          factory: playground,
          sidebarID: SidebarId.PLAYGROUND
        }
      } else if (path.segments.length === 2) {
        switch (path.segments[1]) {
          case 'sorting':
            return {
              title: 'sorting | playground',
              factory: 'sorting',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'curve_fitting':
            return {
              title: 'curve fitting | playground',
              factory: 'curve_fitting',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'resolution':
            return {
              title: 'resolution | playground',
              factory: 'resolution',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'breakout':
            return {
              title: 'breakout | playground',
              factory: 'breakout',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'graphs':
            return {
              title: 'graphs | playground',
              factory: 'graphs',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'fleeing_button':
            return {
              title: 'fleeing button | playground',
              factory: 'fleeing_button',
              sidebarID: SidebarId.PLAYGROUND
            }
        }
      }
  }

  throw new NotFoundError()
}

export async function router (path, store) {
  const rawState = await routerImpl(path, store)
  return new RouterState(Object.assign({ path }, rawState))
}
