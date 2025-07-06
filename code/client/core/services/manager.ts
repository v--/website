import { ClientFileService } from './files.ts'
import { ClientIconService } from './icon_refs.ts'
import { ClientPacmanService } from './pacman.ts'
import { ClientPageService } from './pages.ts'
import { ClientTranslationMapService } from './translation_maps.ts'
import { filesPage } from '../../../common/pages/files.ts'
import { type IEncodedError } from '../../../common/presentable_errors.ts'
import { type IServiceManager } from '../../../common/services.ts'
import { type LanguageId } from '../../../common/translation.ts'
import { type IWebsitePageState } from '../../../common/types/page.ts'
import { type IRehydrationData, REHYDRATION_DATA_SCHEMA } from '../../../common/types/rehydration.ts'
import { ValidationError } from '../../../common/validation/errors.ts'
import { validateSchema } from '../../../common/validation.ts'

export class ClientServiceManager implements IServiceManager {
  #rehydrationData: IRehydrationData | undefined

  readonly files: ClientFileService
  readonly pacman: ClientPacmanService
  readonly page: ClientPageService
  readonly iconRefs: ClientIconService
  readonly translationMaps: ClientTranslationMapService

  static initializeWithRawRehydrationData(rawPageData: string | undefined): ClientServiceManager {
    if (rawPageData === undefined) {
      return new this()
    }

    let json: unknown

    try {
      json = JSON.parse(rawPageData)
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new ValidationError('The page data embedded in the document is invalidly encoded JSON')
      }

      throw err
    }

    const data = validateSchema(REHYDRATION_DATA_SCHEMA, json)
    return new this(data)
  }

  constructor(rehydrationData?: IRehydrationData) {
    this.files = new ClientFileService(
      rehydrationData?.pageData?.tag === 'files' ? rehydrationData.pageData.content : undefined,
    )

    this.pacman = new ClientPacmanService(
      rehydrationData?.pageData?.tag === 'pacman' ? rehydrationData.pageData.content : undefined,
    )

    this.iconRefs = new ClientIconService(rehydrationData?.iconRefPackage)
    this.translationMaps = new ClientTranslationMapService(rehydrationData?.translationPackage)
    this.page = new ClientPageService()

    this.#rehydrationData = rehydrationData
  }

  getDehydratedError(): IEncodedError | undefined {
    if (this.#rehydrationData?.pageData?.tag === 'error') {
      return this.#rehydrationData.pageData.content
    }

    return undefined
  }

  async processPageChange(pageState: IWebsitePageState) {
    if (pageState.page !== filesPage) {
      this.files.resetCache()
    }
  }

  async finalize() {
    await this.files.finalize()
    await this.pacman.finalize()
    await this.iconRefs.finalize()
    await this.page.finalize()
  }
}
