import { type ServerWebsiteEnvironment } from './environment.ts'
import { EXCEPTION_INSTANCE_LANGUAGE } from '../common/presentable_errors/factory.ts'
import { type IconRefId, type TranslationBundleId } from '../common/types/bundles.ts'
import { type IWebsitePageState } from '../common/types/page.ts'
import { type IRehydrationData } from '../common/types/rehydration.ts'

export async function encodeRehydrationData(pageState: IWebsitePageState, env: ServerWebsiteEnvironment): Promise<IRehydrationData> {
  const languageId = env.language$.value

  const iconRefIds = new Set<IconRefId>(pageState.iconRefIds)
  iconRefIds.add('core')

  const translationBundleIds = new Set<TranslationBundleId>(pageState.translationBundleIds)
  translationBundleIds.add('core')
  translationBundleIds.add(pageState.titleSpec.bundleId)
  translationBundleIds.add(pageState.descriptionSpec.bundleId)

  const rehydrationData: IRehydrationData = {
    iconMaps: await Promise.all(
      Array.from(iconRefIds).map(async function (refId) {
        return { refId, map: await env.services.icons.getIconRef(refId) }
      }),
    ),

    translationMaps: await Promise.all(
      Array.from(translationBundleIds).map(async function (bundleId) {
        return { bundleId, languageId, map: await env.services.translation.getTranslationMap(bundleId, languageId) }
      }),
    ),
  }

  const errorTranslationBundleIds = new Set<TranslationBundleId>(pageState.errorTranslationBundleIds)

  // We preload the error translations in both the current language and in English. THe later is necessary for creating exception objects.
  errorTranslationBundleIds.add('core_error')

  for (const bundleId of errorTranslationBundleIds) {
    rehydrationData.translationMaps.push({
      bundleId,
      languageId,
      map: await env.services.translation.getTranslationMap(bundleId, languageId),
    })

    rehydrationData.translationMaps.push({
      bundleId,
      languageId: EXCEPTION_INSTANCE_LANGUAGE,
      map: await env.services.translation.getTranslationMap(bundleId, EXCEPTION_INSTANCE_LANGUAGE),
    })
  }

  if (pageState.pageDataHydrationTag) {
    rehydrationData.pageData = { tag: pageState.pageDataHydrationTag, content: pageState.pageData }
  }

  return rehydrationData
}
