import { type IFileService } from './files.ts'
import { type IPacmanService } from './pacman.ts'
import { type IWebsitePageService } from './pages.ts'
import { type ITranslationMapService } from './translation_maps.ts'

export interface IServiceManager {
  files: IFileService
  pacman: IPacmanService
  page: IWebsitePageService
  translationMaps: ITranslationMapService
}
