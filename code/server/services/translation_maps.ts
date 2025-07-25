import { API_LANGUAGE, WEBSITE_LANGUAGE_IDS, type WebsiteLanguageId } from '../../common/languages.ts'
import { type ITranslationMapService } from '../../common/services.ts'
import { type Path } from '../../common/support/path.ts'
import { type ITranslationPackage, TRANSLATION_MAP_SCHEMA } from '../../common/translation.ts'
import { TRANSLATION_BUNDLE_IDS, type TranslationBundleId } from '../../common/types/bundles.ts'
import { readJsonWithSchema } from '../validation.ts'

export class ServerTranslationMapService implements ITranslationMapService {
  #basePath: Path
  #package: ITranslationPackage

  constructor(basePath: Path) {
    this.#basePath = basePath
    this.#package = []
  }

  async* #iterPackageEntries() {
    for (const bundleId of TRANSLATION_BUNDLE_IDS) {
      for (const languageId of WEBSITE_LANGUAGE_IDS) {
        if (bundleId === 'api' && languageId !== API_LANGUAGE) {
          continue
        }

        const map = await readJsonWithSchema(
          TRANSLATION_MAP_SCHEMA,
          this.#basePath.pushRight(bundleId, languageId + '.json'),
        )

        yield { bundleId, languageId, map }
      }
    }
  }

  async preload() {
    this.#package = await Array.fromAsync(this.#iterPackageEntries())
  }

  updateFilePath(basePath: Path) {
    this.#basePath = basePath
  }

  async getTranslationMap(languageId: WebsiteLanguageId, bundleId: TranslationBundleId) {
    return this.#package.find(entry => entry.languageId === languageId && entry.bundleId === bundleId)!.map
  }

  async getTranslationPackage(languageId: WebsiteLanguageId, bundleIds: TranslationBundleId[]) {
    return this.#package.filter(entry => entry.languageId === languageId && bundleIds.includes(entry.bundleId))
  }

  async finalize() {}
}
