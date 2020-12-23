import { IStore } from '../common/types/store.js'
import { FileCollection } from './collections/file.js'
import { PacmanPackageCollection } from './collections/pacman_package.js'
import { IStoreConfig } from './config.js'

export class Store implements IStore {
  collections: {
    files: FileCollection
    pacmanPackages: PacmanPackageCollection
  }

  constructor(
    public config: IStoreConfig
  ) {
    this.collections = {
      files: new FileCollection(config.fileRootPath),
      pacmanPackages: new PacmanPackageCollection(config.pacmanDBPath)
    }
  }

  async load() {
    await this.collections.pacmanPackages.cachePackages()
  }

  async reload(config: IStoreConfig) {
    this.collections.pacmanPackages.updateDBPath(config.pacmanDBPath)
    await this.collections.pacmanPackages.cachePackages()
    this.config = config
  }
}
