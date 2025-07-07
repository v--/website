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
  realPacman: ServerPacmanService
  mockPacman: ServerPacmanService
  icons: ServerIconRefService
  page: ServerPageService
  translation: ServerTranslationMapService

  constructor(config: IServiceConfig) {
    this.translation = new ServerTranslationMapService(Path.parse(config.translation.root))
    this.realFiles = new ServerFileService(Path.parse(config.files.realRoot))
    this.mockFiles = new ServerFileService(Path.parse(config.files.mockRoot))
    this.realPacman = new ServerPacmanService(Path.parse(config.pacman.realDBPath))
    this.mockPacman = new ServerPacmanService(Path.parse(config.pacman.mockDBPath))
    this.icons = new ServerIconRefService(Path.parse(config.icons.root))
    this.page = new ServerPageService()
  }

  async preload() {
    await this.realPacman.preload()
    await this.mockPacman.preload()
    await this.icons.preload()
    await this.translation.preload()
  }

  async reload(config: IServiceConfig) {
    this.realFiles.updateRootPath(Path.parse(config.files.realRoot))
    this.mockFiles.updateRootPath(Path.parse(config.files.mockRoot))

    this.realPacman.updateDbPath(Path.parse(config.pacman.realDBPath))
    await this.realPacman.preload()

    this.mockPacman.updateDbPath(Path.parse(config.pacman.mockDBPath))
    await this.mockPacman.preload()

    this.icons.updateFilePath(Path.parse(config.icons.root))
    await this.icons.preload()

    this.translation.updateFilePath(Path.parse(config.translation.root))
    await this.translation.preload()
  }

  async finalize() {
    await this.realFiles.finalize()
    await this.mockFiles.finalize()
    await this.realPacman.finalize()
    await this.mockPacman.finalize()
    await this.icons.finalize()
    await this.page.finalize()
    await this.translation.finalize()
  }

  getManager(useMockData: boolean): IServerServiceManager {
    return {
      files: useMockData ? this.mockFiles : this.realFiles,
      pacman: useMockData ? this.mockPacman : this.realPacman,
      page: this.page,
      iconRefs: this.icons,
      translationMaps: this.translation,
    }
  }
}
