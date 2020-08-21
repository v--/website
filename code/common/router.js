import { NotFoundError } from './errors.js'
import { SidebarId } from './enums/sidebar_id.js'
import { RouterState } from './support/router_state.js'
import { PAGE_DESCRIPTIONS } from './constants/page_descriptions.js'

import { home } from './views/home.js'
import { files } from './views/files.js'
import { pacman } from './views/pacman.js'
import { playground } from './views/playground.js'

async function routerImpl (path, store) {
  if (path.segments.length === 0) {
    return {
      title: 'home',
      description: PAGE_DESCRIPTIONS.home,
      factory: home,
      sidebarID: SidebarId.HOME
    }
  }

  switch (path.segments[0]) {
    case 'files':
      return {
        title: path.underCooked,
        description: PAGE_DESCRIPTIONS.files,
        factory: files,
        data: await store.collections.files.readDirectory(path.segments.slice(1).join('/')),
        sidebarID: SidebarId.FILES
      }

    case 'pacman':
      if (path.segments.length > 1) {
        throw new NotFoundError()
      }

      return {
        title: 'pacman',
        description: PAGE_DESCRIPTIONS.pacman,
        factory: pacman,
        data: await store.collections.pacmanPackages.load(),
        sidebarID: SidebarId.PACMAN
      }

    case 'playground':
      if (path.segments.length === 1) {
        return {
          title: 'playground',
          description: PAGE_DESCRIPTIONS.playground.index,
          factory: playground,
          sidebarID: SidebarId.PLAYGROUND
        }
      } else if (path.segments.length === 2) {
        switch (path.segments[1]) {
          case 'sorting':
            return {
              title: 'sorting | playground',
              description: PAGE_DESCRIPTIONS.playground.sorting,
              factory: 'sorting',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'curve_fitting':
            return {
              title: 'curve fitting | playground',
              description: PAGE_DESCRIPTIONS.playground.curve_fitting,
              factory: 'curve_fitting',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'resolution':
            return {
              title: 'resolution | playground',
              description: PAGE_DESCRIPTIONS.playground.resolution,
              factory: 'resolution',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'breakout':
            return {
              title: 'breakout | playground',
              description: PAGE_DESCRIPTIONS.playground.breakout,
              factory: 'breakout',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'graphs':
            return {
              title: 'graphs | playground',
              description: PAGE_DESCRIPTIONS.playground.graphs,
              factory: 'graphs',
              sidebarID: SidebarId.PLAYGROUND
            }

          case 'fleeing_button':
            return {
              title: 'fleeing button | playground',
              description: PAGE_DESCRIPTIONS.playground.fleeing_button,
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
