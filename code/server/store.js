import { FileCollection } from './collections/file.js'
import { PacmanPackageCollection } from './collections/pacman_package.js'

/**
 * @implements Stores.IStore
 */
export class Store {
  /**
   * @param { Server.IStoreConfig } config
   */
  constructor(config) {
    this.collections = {
      files: new FileCollection(config.fileRootPath),
      pacmanPackages: new PacmanPackageCollection(config.pacmanDBPath)
    }
  }

  async load() {
    await this.collections.pacmanPackages.cachePackages()
  }
  /**
   * @param { Server.IStoreConfig } config
   */
  async reload(config) {
    this.collections.pacmanPackages.updateDBPath(config.pacmanDBPath)
    await this.collections.pacmanPackages.cachePackages()
    this.config = config
  }
}
