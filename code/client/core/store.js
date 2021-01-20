import { processDirectory } from '../../common/store/files.js'
import { processPacmanPackages } from '../../common/store/pacman_packages.js'

import { fetchJSON } from './support/dom.js'

/**
 * @implements TStore.IStore
 */
export class Store {
  collections = {
    files: {
      /**
       * @param {string} path
       */
      async readDirectory(path) {
        return processDirectory(await fetchJSON(`/api/files/${path}`))
      }
    },

    pacmanPackages: {
      async load() {
        return processPacmanPackages(await fetchJSON('/api/pacman'))
      }
    }
  }
}

/**
 * @implements TStore.IStore
 */
export class MockStore {
  /**
   * @param {any} data
   */
  constructor(data) {
    this.collections = {
      files: {
        async readDirectory() { return processDirectory(data) }
      },

      pacmanPackages: {
        async load() { return processPacmanPackages(data) }
      }
    }
  }
}
