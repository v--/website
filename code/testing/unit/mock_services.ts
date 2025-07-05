import { MockCache } from './mock_cache.ts'
import { placeholder } from '../../common/pages/placeholder.ts'
import { PresentableErrorFactory } from '../../common/presentable_errors.ts'
import { type IServiceManager, type ITranslationMapLabel } from '../../common/services.ts'
import { type Path } from '../../common/support/path.ts'
import { type ITranslationMap, type LanguageId } from '../../common/translation.ts'
import { type IconRefId, type PlaygroundPageId, type TranslationBundleId } from '../../common/types/bundles.ts'

const TRANSLATION_CACHE = new MockCache<ITranslationMapLabel, ITranslationMap>()

export class MockServiceManager implements IServiceManager {
  files = {
    async readDirectory(path: Path) {
      return { path: path.toString(), entries: [] }
    },
  }

  pacman = {
    async fetchRepository() {
      return { packages: [] }
    },
  }

  icons = {
    async getIconRef(_refId: IconRefId) {
      return {}
    },

    getPreloadedIconRef(_refId: IconRefId) {
      return {}
    },
  }

  translation = {
    errorFactory: new PresentableErrorFactory(TRANSLATION_CACHE),

    async getTranslationMap(_bundleId: TranslationBundleId, _lang: LanguageId) {
      return {}
    },

    getPreloadedTranslationMap(_bundleId: TranslationBundleId, _lang: LanguageId) {
      return {}
    },
  }

  page = {
    async retrievePlaygroundPage(_pageId: PlaygroundPageId) {
      return placeholder
    },
  }
}
