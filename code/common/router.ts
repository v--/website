import { NotFoundError } from './errors.js'
import { SidebarId } from './enums/sidebar_id.js'
import { RouterState, RouterStateParams } from './support/router_state.js'
import { PAGE_DESCRIPTIONS } from './constants/page_descriptions.js'

import { home } from './views/home.js'
import { files } from './views/files.js'
import { pacman } from './views/pacman.js'
import { playground } from './views/playground.js'
import { IStore } from './types/store.js'
import { Path } from './support/path.js'

async function routerImpl(path: Path, store: IStore): Promise<Omit<RouterStateParams, 'path'>> {
  if (path.segments.length === 0) {
    return {
      title: 'home',
      description: PAGE_DESCRIPTIONS.home,
      factory: home,
      sidebarId: SidebarId.home
    }
  }

  switch (path.segments[0]) {
    case 'files':
      return {
        title: path.underCooked,
        description: PAGE_DESCRIPTIONS.files,
        factory: files,
        data: await store.collections.files.readDirectory(path.segments.slice(1).join('/')),
        sidebarId: SidebarId.files
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
        sidebarId: SidebarId.pacman
      }

    case 'playground':
      if (path.segments.length === 1) {
        return {
          title: 'playground',
          description: PAGE_DESCRIPTIONS.playground.index,
          factory: playground,
          sidebarId: SidebarId.playground
        }
      } else if (path.segments.length === 2) {
        switch (path.segments[1]) {
          case 'sorting':
            return {
              title: 'sorting | playground',
              description: PAGE_DESCRIPTIONS.playground.sorting,
              factory: 'sorting',
              sidebarId: SidebarId.playground
            }

          case 'curve_fitting':
            return {
              title: 'curve fitting | playground',
              description: PAGE_DESCRIPTIONS.playground.curve_fitting,
              factory: 'curve_fitting',
              sidebarId: SidebarId.playground
            }

          case 'resolution':
            return {
              title: 'resolution | playground',
              description: PAGE_DESCRIPTIONS.playground.resolution,
              factory: 'resolution',
              sidebarId: SidebarId.playground
            }

          case 'breakout':
            return {
              title: 'breakout | playground',
              description: PAGE_DESCRIPTIONS.playground.breakout,
              factory: 'breakout',
              sidebarId: SidebarId.playground
            }

          case 'graphs':
            return {
              title: 'graphs | playground',
              description: PAGE_DESCRIPTIONS.playground.graphs,
              factory: 'graphs',
              sidebarId: SidebarId.playground
            }

          case 'fleeing_button':
            return {
              title: 'fleeing button | playground',
              description: PAGE_DESCRIPTIONS.playground.fleeing_button,
              factory: 'fleeing_button',
              sidebarId: SidebarId.playground
            }

          case 'motifs':
            return {
              title: 'motifs | playground',
              description: PAGE_DESCRIPTIONS.playground.motifs,
              factory: 'motifs',
              sidebarId: SidebarId.playground
            }
        }
      }
  }

  throw new NotFoundError()
}

export async function router(path: Path, store: IStore) {
  const rawState = await routerImpl(path, store)
  return new RouterState(Object.assign({ path }, rawState))
}
