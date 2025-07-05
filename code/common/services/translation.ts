import { type PresentableErrorFactory } from '../presentable_errors.ts'
import { type ITranslationMap, type LanguageId } from '../translation.ts'
import { type TranslationBundleId } from '../types/bundles.ts'

/**
 * This label uniquely identifier a translation map
 */
export interface ITranslationMapLabel {
  bundleId: TranslationBundleId
  languageId: LanguageId
}

export interface ITranslationService {
  errorFactory: PresentableErrorFactory
  getTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId): Promise<ITranslationMap>
  getPreloadedTranslationMap(bundleId: TranslationBundleId, languageId: LanguageId): ITranslationMap
}
