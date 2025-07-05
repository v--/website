import { type IFileService } from './files.ts'
import { type IIconService } from './icons.ts'
import { type IPacmanService } from './pacman.ts'
import { type IWebsitePageService } from './pages.ts'
import { type ITranslationService } from './translation.ts'

export interface IServiceManager {
  files: IFileService
  pacman: IPacmanService
  icons: IIconService
  page: IWebsitePageService
  translation: ITranslationService
}
