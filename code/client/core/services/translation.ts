import { ManualCache } from '../../../common/cache.ts'
import { PresentableErrorFactory } from '../../../common/presentable_errors.ts'
import { type ITranslationMapLabel, type ITranslationService } from '../../../common/services.ts'
import { Path } from '../../../common/support/path.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { type ITranslationMap, type LanguageId, TRANSLATION_MAP_SCHEMA } from '../../../common/translation.ts'
import { type TranslationBundleId } from '../../../common/types/bundles.ts'
import { type IRehydrationData } from '../../../common/types/rehydration.ts'
import { validateSchema } from '../../../common/validation.ts'
import { HttpClient } from '../dom.ts'

const BASE_TRANSLATION_PATH = Path.parse('/api/translation')

export class ClientTranslationMapCache extends ManualCache<ITranslationMapLabel, ITranslationMap> {
  readonly errorFactory: PresentableErrorFactory
  readonly httpClient: HttpClient

  constructor() {
    super()
    this.errorFactory = new PresentableErrorFactory(this)
    this.httpClient = new HttpClient(this.errorFactory)
  }

  override async _resolveValue({ bundleId, languageId }: ITranslationMapLabel) {
    const json = await this.httpClient.fetchJson(
      new UrlPath(BASE_TRANSLATION_PATH.pushRight(bundleId), new Map([['lang', languageId]])),
    )

    return validateSchema(TRANSLATION_MAP_SCHEMA, json)
  }
}

/**
 * A wrapper around /api/icons with manual caching.
 *
 * Either we start with rehydrated data and make no network requests,
 * or we only make one and cache it.
 */
export class ClientTranslationService implements ITranslationService {
  #cache = new ClientTranslationMapCache()
  readonly errorFactory: PresentableErrorFactory
  readonly httpClient: HttpClient

  constructor(rehydratedData: IRehydrationData['translationMaps'] | undefined) {
    if (rehydratedData) {
      for (const { bundleId, languageId, map } of rehydratedData) {
        this.#cache.putIntoCache({ bundleId, languageId }, map)
      }
    }

    this.errorFactory = this.#cache.errorFactory
    this.httpClient = this.#cache.httpClient
  }

  async getTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId) {
    return await this.#cache.getValue({ bundleId, languageId })
  }

  getPreloadedTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId) {
    return this.#cache.getCachedValue({ bundleId, languageId })
  }

  preloadTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId) {
    return this.#cache.fetchAndCache({ bundleId, languageId })
  }

  async finalize() {
    await this.#cache.finalize()
  }
}
