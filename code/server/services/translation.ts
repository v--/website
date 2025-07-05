import { ManualCache } from '../../common/cache.ts'
import { EXCEPTION_INSTANCE_LANGUAGE } from '../../common/presentable_errors/factory.ts'
import { PresentableErrorFactory } from '../../common/presentable_errors.ts'
import { type ITranslationMapLabel, type ITranslationService } from '../../common/services.ts'
import { type Path } from '../../common/support/path.ts'
import { type ITranslationMap, LANGUAGE_IDS, type LanguageId, TRANSLATION_MAP_SCHEMA } from '../../common/translation.ts'
import { TRANSLATION_BUNDLE_IDS, type TranslationBundleId } from '../../common/types/bundles.ts'
import { readJsonWithSchema } from '../validation.ts'

export class ServerTranslationMapCache extends ManualCache<ITranslationMapLabel, ITranslationMap> {
  #basePath: Path

  constructor(basePath: Path) {
    super()
    this.#basePath = basePath
  }

  updateBasePath(basePath: Path) {
    this.#basePath = basePath
  }

  override async _resolveValue({ bundleId, languageId }: ITranslationMapLabel) {
    return readJsonWithSchema(
      TRANSLATION_MAP_SCHEMA,
      this.#basePath.pushRight(bundleId, languageId + '.json'),
    )
  }
}

export class ServerTranslationService implements ITranslationService {
  #cache: ServerTranslationMapCache
  readonly errorFactory: PresentableErrorFactory

  constructor(basePath: Path) {
    this.#cache = new ServerTranslationMapCache(basePath)
    this.errorFactory = new PresentableErrorFactory(this.#cache)
  }

  async load() {
    this.#cache.invalidateAll()

    for (const bundleId of TRANSLATION_BUNDLE_IDS) {
      if (bundleId === 'server') {
        await this.#cache.fetchAndCache({ bundleId, languageId: EXCEPTION_INSTANCE_LANGUAGE })
      } else {
        for (const languageId of LANGUAGE_IDS) {
          await this.#cache.fetchAndCache({ bundleId, languageId })
        }
      }
    }
  }

  updateFilePath(basePath: Path) {
    this.#cache.updateBasePath(basePath)
  }

  getTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId) {
    return this.#cache.getValue({ bundleId, languageId })
  }

  getPreloadedTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId) {
    return this.#cache.getCachedValue({ bundleId, languageId })
  }

  async finalize() {
    return this.#cache.finalize()
  }
}
