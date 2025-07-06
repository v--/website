import { ManualCache } from '../../../common/cache.ts'
import { type ITranslationMapService } from '../../../common/services.ts'
import { Path } from '../../../common/support/path.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { type ITranslationMap, type LanguageId, TRANSLATION_MAP_SCHEMA } from '../../../common/translation.ts'
import { type TranslationBundleId } from '../../../common/types/bundles.ts'
import { type IRehydrationData } from '../../../common/types/rehydration.ts'
import { validateSchema } from '../../../common/validation.ts'
import { fetchJson } from '../dom.ts'

const BASE_TRANSLATION_PATH = Path.parse('/api/translation')

/**
 * This label uniquely identifier a translation map
 */
export interface ITranslationMapLabel {
  bundleId: TranslationBundleId
  languageId: LanguageId
}

export class ClientTranslationMapCache extends ManualCache<ITranslationMapLabel, ITranslationMap> {
  override async _resolveValue({ bundleId, languageId }: ITranslationMapLabel) {
    const json = await fetchJson(
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
export class ClientTranslationMapService implements ITranslationMapService {
  #cache = new ClientTranslationMapCache()

  constructor(rehydratedData: IRehydrationData['translationPackage'] | undefined) {
    if (rehydratedData) {
      for (const { bundleId, languageId, map } of rehydratedData) {
        this.#cache.putIntoCache({ bundleId, languageId }, map)
      }
    }
  }

  async getTranslationMap(languageId: LanguageId, bundleId: TranslationBundleId) {
    return await this.#cache.getValue({ bundleId, languageId })
  }

  async getTranslationPackage(languageId: LanguageId, bundleIds: TranslationBundleId[]) {
    return await Promise.all(
      bundleIds.map(async bundleId => {
        return {
          bundleId, languageId,
          map: await this.getTranslationMap(languageId, bundleId),
        }
      }),
    )
  }

  async finalize() {
    await this.#cache.finalize()
  }
}
