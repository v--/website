import { ClientFileService } from './files.ts'
import { ClientIconService } from './icons.ts'
import { ClientPacmanService } from './pacman.ts'
import { ClientPageService } from './pages.ts'
import { ClientTranslationService } from './translation.ts'
import { filesPage } from '../../../common/pages/files.ts'
import { EXCEPTION_INSTANCE_LANGUAGE } from '../../../common/presentable_errors/factory.ts'
import { type IEncodedError } from '../../../common/presentable_errors.ts'
import { type IServiceManager } from '../../../common/services.ts'
import { type IWebsitePageState } from '../../../common/types/page.ts'
import { type IRehydrationData, REHYDRATION_DATA_SCHEMA } from '../../../common/types/rehydration.ts'
import { ValidationError } from '../../../common/validation/errors.ts'
import { validateSchema } from '../../../common/validation.ts'
import { type HttpClient } from '../dom.ts'

export class ClientServiceManager implements IServiceManager {
  #rehydrationData: IRehydrationData | undefined

  readonly httpClient: HttpClient
  readonly files: ClientFileService
  readonly pacman: ClientPacmanService
  readonly icons: ClientIconService
  readonly page: ClientPageService
  readonly translation: ClientTranslationService

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
    this.translation = new ClientTranslationService(rehydrationData?.translationMaps)
    this.httpClient = this.translation.httpClient
    this.files = new ClientFileService(
      this.httpClient,
      rehydrationData?.pageData?.tag === 'files' ? rehydrationData.pageData.content : undefined,
    )

    this.pacman = new ClientPacmanService(
      this.httpClient,
      rehydrationData?.pageData?.tag === 'pacman' ? rehydrationData.pageData.content : undefined,
    )

    this.icons = new ClientIconService(this.httpClient, rehydrationData?.iconMaps)
    this.page = new ClientPageService()

    this.#rehydrationData = rehydrationData
  }

  getDehydratedError(): IEncodedError | undefined {
    if (this.#rehydrationData?.pageData?.tag === 'error') {
      return this.#rehydrationData.pageData.content
    }

    return undefined
  }

  async processPageState(pageState: IWebsitePageState) {
    if (pageState.page !== filesPage) {
      this.files.resetCache()
    }

    if (pageState.iconRefIds) {
      for (const refId of pageState.iconRefIds) {
        await this.icons.preloadIconRef(refId)
      }
    }

    if (pageState.errorTranslationBundleIds) {
      for (const bundleId of pageState.errorTranslationBundleIds) {
        // We only preload the translations in English, which is necessary for creating exception objects.
        await this.translation.preloadTranslationMap(bundleId, EXCEPTION_INSTANCE_LANGUAGE)
      }
    }
  }

  async finalize() {
    await this.files.finalize()
    await this.pacman.finalize()
    await this.icons.finalize()
    await this.page.finalize()
  }
}
