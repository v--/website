import { type WebsiteLanguageId } from '../languages.ts'
import { type ITranslationMap, type ITranslationPackage } from '../translation.ts'
import { type TranslationBundleId } from '../types/bundles.ts'

export interface ITranslationMapService {
  getTranslationMap(languageId: WebsiteLanguageId, bundleId: TranslationBundleId): Promise<ITranslationMap>
  getTranslationPackage(languageId: WebsiteLanguageId, bundleIds: TranslationBundleId[]): Promise<ITranslationPackage>
}
