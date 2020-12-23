import { processDirectory } from '../../common/types/files.js'
import { processPacmanPackages } from '../../common/types/pacman_packages.js'
import { IFileCollection, IPacmanPackageCollection, IStore } from '../../common/types/store.js'
import { fetchJSON } from './support/dom.js'

export class Store implements IStore {
  collections = {
    files: {
      async readDirectory(path: string) {
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

export class MockStore implements IStore {
  collections: {
    files: IFileCollection
    pacmanPackages: IPacmanPackageCollection
  }

  constructor(data: unknown) {
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
