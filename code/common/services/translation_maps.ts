import { type ITranslationPackage } from '../translation/types.ts'
import { type ITranslationMap, type LanguageId } from '../translation.ts'
import { type TranslationBundleId } from '../types/bundles.ts'

export interface ITranslationMapService {
  getTranslationMap(languageId: LanguageId, bundleId: TranslationBundleId): Promise<ITranslationMap>
  getTranslationPackage(languageId: LanguageId, bundleIds: TranslationBundleId[]): Promise<ITranslationPackage>
}
