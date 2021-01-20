import { NotFoundError } from './errors.js'
import { PAGE_DESCRIPTIONS } from './constants/page_descriptions.js'

import { home } from './views/home.js'
import { files } from './views/files.js'
import { pacman } from './views/pacman.js'
import { playground } from './views/playground.js'
import { Path } from './support/path.js'

/**
 * @param {Path} path
 * @param {TStore.IStore} store
 * @returns {Promise<TCons.PartialWith<TRouter.IRouterResult, 'path' | 'data'>>}
 */
async function routerImpl(path, store) {
  if (path.segments.length === 0) {
    return {
      title: 'home',
      description: PAGE_DESCRIPTIONS.home,
      factory: home,
      sidebarId: 'home'
    }
  }

  switch (path.segments[0]) {
    case 'files':
      return {
        title: path.underCooked,
        description: PAGE_DESCRIPTIONS.files,
        factory: files,
        data: await store.collections.files.readDirectory(path.segments.slice(1).join('/')),
        sidebarId: 'files'
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
        sidebarId: 'pacman'
      }

    case 'playground':
      if (path.segments.length === 1) {
        return {
          title: 'playground',
          description: PAGE_DESCRIPTIONS.playground.index,
          factory: playground,
          sidebarId: 'playground'
        }
      } else if (path.segments.length === 2) {
        switch (path.segments[1]) {
          case 'sorting':
            return {
              title: 'sorting | playground',
              description: PAGE_DESCRIPTIONS.playground.sorting,
              factory: 'sorting',
              sidebarId: 'playground'
            }

          case 'curve_fitting':
            return {
              title: 'curve fitting | playground',
              description: PAGE_DESCRIPTIONS.playground.curve_fitting,
              factory: 'curve_fitting',
              sidebarId: 'playground'
            }

          case 'resolution':
            return {
              title: 'resolution | playground',
              description: PAGE_DESCRIPTIONS.playground.resolution,
              factory: 'resolution',
              sidebarId: 'playground'
            }

          case 'breakout':
            return {
              title: 'breakout | playground',
              description: PAGE_DESCRIPTIONS.playground.breakout,
              factory: 'breakout',
              sidebarId: 'playground'
            }

          case 'graphs':
            return {
              title: 'graphs | playground',
              description: PAGE_DESCRIPTIONS.playground.graphs,
              factory: 'graphs',
              sidebarId: 'playground'
            }

          case 'fleeing_button':
            return {
              title: 'fleeing button | playground',
              description: PAGE_DESCRIPTIONS.playground.fleeing_button,
              factory: 'fleeing_button',
              sidebarId: 'playground'
            }

          case 'motifs':
            return {
              title: 'motifs | playground',
              description: PAGE_DESCRIPTIONS.playground.motifs,
              factory: 'motifs',
              sidebarId: 'playground'
            }
        }
      }
  }

  throw new NotFoundError()
}

/**
 * @param {Path} path
 * @param {TStore.IStore} store
 * @returns TRouter.IRouterState
 */
export async function router(path, store) {
  const rawState = await routerImpl(path, store)
  return { path, data: undefined, ...rawState }
}
