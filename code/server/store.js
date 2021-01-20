import { FileCollection } from './collections/file.js'
import { PacmanPackageCollection } from './collections/pacman_package.js'

/**
 * @implements TStore.IStore
 */
export class Store {
  /**
   * @param {TServer.IStoreConfig} config
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
   * @param {TServer.IStoreConfig} config
   */
  async reload(config) {
    this.collections.pacmanPackages.updateDBPath(config.pacmanDBPath)
    await this.collections.pacmanPackages.cachePackages()
    this.config = config
  }
}
