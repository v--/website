import { FileCollection } from './collections/file.js'
import { GalleryCollection } from './collections/gallery.js'
import { PacmanPackageCollection } from './collections/pacman_package.js'

export class Store {
  constructor (config) {
    this.config = config
    this.collections = {
      files: new FileCollection(this),
      gallery: new GalleryCollection(this),
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
