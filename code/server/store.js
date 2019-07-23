import FileCollection from './collections/file.js'
import PacmanPackageCollection from './collections/pacman_package.js'

export default class Store {
  constructor (config) {
    this.config = config
    this.collections = {
      files: new FileCollection(this),
      pacmanPackages: new PacmanPackageCollection(this)
    }
  }

  async load () {
    await this.collections.pacmanPackages.cachePackages(this.config.pacmanDBPath)
  }

  async reload (config) {
    await this.collections.pacmanPackages.cachePackages(config.pacmanDBPath)
    this.config = config
  }
}
