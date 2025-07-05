import { type IServiceManager } from '../../common/services.ts'
import { Path } from '../../common/support/path.ts'
import { type IServiceConfig } from '../config.ts'
import { ServerFileService } from './files.ts'
import { ServerIconService } from './icons.ts'
import { ServerPacmanService } from './pacman.ts'
import { ServerPageService } from './pages.ts'
import { ServerTranslationService } from './translation.ts'

export class ServerServiceManagerFactory {
  realFiles: ServerFileService
  mockFiles: ServerFileService
  pacman: ServerPacmanService
  icons: ServerIconService
  page: ServerPageService
  translation: ServerTranslationService

  constructor(config: IServiceConfig) {
    this.translation = new ServerTranslationService(Path.parse(config.translation.root))
    this.realFiles = new ServerFileService(Path.parse(config.files.realRoot), this.translation.errorFactory)
    this.mockFiles = new ServerFileService(Path.parse(config.files.mockRoot), this.translation.errorFactory)
    this.pacman = new ServerPacmanService(Path.parse(config.pacman.dbPath))
    this.icons = new ServerIconService(Path.parse(config.icons.root))
    this.page = new ServerPageService()
  }

  async load() {
    await this.pacman.load()
    await this.icons.load()
    await this.translation.load()
  }

  async reload(config: IServiceConfig) {
    this.realFiles.updateRootPath(Path.parse(config.files.realRoot))
    this.mockFiles.updateRootPath(Path.parse(config.files.mockRoot))

    this.pacman.updateDbPath(Path.parse(config.pacman.dbPath))
    await this.pacman.load()

    this.icons.updateFilePath(Path.parse(config.icons.root))
    await this.icons.load()

    this.translation.updateFilePath(Path.parse(config.translation.root))
    await this.translation.load()
  }

  async finalize() {
    await this.realFiles.finalize()
    await this.mockFiles.finalize()
    await this.pacman.finalize()
    await this.icons.finalize()
    await this.page.finalize()
    await this.translation.finalize()
  }

  getManager(useMockData: boolean): IServiceManager {
    return {
      files: useMockData ? this.mockFiles : this.realFiles,
      pacman: this.pacman,
      icons: this.icons,
      page: this.page,
      translation: this.translation,
    }
  }
}
