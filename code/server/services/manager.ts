import { type IServiceManager } from '../../common/services.ts'
import { Path } from '../../common/support/path.ts'
import { type IServiceConfig } from '../config.ts'
import { ServerFileService } from './files.ts'
import { ServerIconRefService } from './icon_refs.ts'
import { ServerPacmanService } from './pacman.ts'
import { ServerPageService } from './pages.ts'
import { ServerTranslationMapService } from './translation_maps.ts'

export interface IServerServiceManager extends IServiceManager {
  files: ServerFileService
  pacman: ServerPacmanService
  page: ServerPageService
  iconRefs: ServerIconRefService
  translationMaps: ServerTranslationMapService
}

export class ServerServiceManagerFactory {
  realFiles: ServerFileService
  mockFiles: ServerFileService
  pacman: ServerPacmanService
  icons: ServerIconRefService
  page: ServerPageService
  translation: ServerTranslationMapService

  constructor(config: IServiceConfig) {
    this.translation = new ServerTranslationMapService(Path.parse(config.translation.root))
    this.realFiles = new ServerFileService(Path.parse(config.files.realRoot))
    this.mockFiles = new ServerFileService(Path.parse(config.files.mockRoot))
    this.pacman = new ServerPacmanService(Path.parse(config.pacman.dbPath))
    this.icons = new ServerIconRefService(Path.parse(config.icons.root))
    this.page = new ServerPageService()
  }

  async preload() {
    await this.pacman.load()
    await this.icons.preload()
    await this.translation.preload()
  }

  async reload(config: IServiceConfig) {
    this.realFiles.updateRootPath(Path.parse(config.files.realRoot))
    this.mockFiles.updateRootPath(Path.parse(config.files.mockRoot))

    this.pacman.updateDbPath(Path.parse(config.pacman.dbPath))
    await this.pacman.load()

    this.icons.updateFilePath(Path.parse(config.icons.root))
    await this.icons.preload()

    this.translation.updateFilePath(Path.parse(config.translation.root))
    await this.translation.preload()
  }

  async finalize() {
    await this.realFiles.finalize()
    await this.mockFiles.finalize()
    await this.pacman.finalize()
    await this.icons.finalize()
    await this.page.finalize()
    await this.translation.finalize()
  }

  getManager(useMockData: boolean): IServerServiceManager {
    return {
      files: useMockData ? this.mockFiles : this.realFiles,
      pacman: this.pacman,
      page: this.page,
      iconRefs: this.icons,
      translationMaps: this.translation,
    }
  }
}
