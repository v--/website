import { type WebsiteLanguageId } from './languages.ts'
import { ReplaySubject, Subject, first } from './observable.ts'
import { type IServiceManager } from './services.ts'
import { type UrlPath } from './support/url_path.ts'
import { GetText } from './translation.ts'
import { type TranslationBundleId } from './types/bundles.ts'
import { type IFinalizeable } from './types/finalizable.ts'
import { type ColorScheme, type IWebsitePageState } from './types/page.ts'

export interface IEnvironmentConfig {
  services: IServiceManager
  language: WebsiteLanguageId
  colorScheme?: ColorScheme
  sidebarCollapsed?: boolean
  loading?: boolean
}

export abstract class WebsiteEnvironment implements IFinalizeable {
  readonly services: IServiceManager
  readonly gettext: GetText
  readonly urlPath$ = new Subject<UrlPath>()
  readonly sidebarCollapsed$ = new ReplaySubject<boolean | undefined>()
  readonly colorScheme$ = new ReplaySubject<ColorScheme | undefined>()
  readonly loading$ = new ReplaySubject<boolean>()

  constructor(config: IEnvironmentConfig) {
    this.services = config.services
    this.gettext = new GetText(config.language)
    this.colorScheme$.next(config.colorScheme)
    this.sidebarCollapsed$.next(config.sidebarCollapsed)
    this.loading$.next(config.loading ?? false)
  }

  abstract getActualColorScheme(): ColorScheme
  abstract isContentDynamic(): boolean

  async preloadTranslationPackage(lang: WebsiteLanguageId, bundleIds: TranslationBundleId[]) {
    const extended = bundleIds.includes('core') ? bundleIds : ['core' as const, ...bundleIds]
    const pkg = await this.services.translationMaps.getTranslationPackage(lang, extended)
    this.gettext.updatePackage(pkg)
  }

  async preloadPageData(pageState: IWebsitePageState) {
    const currentLanguage = this.gettext.getCurrentLanguage()
    const bundleIds = new Set(pageState.translationBundleIds)

    for (const spec of pageState.titleSegmentSpecs) {
      bundleIds.add(spec.bundleId)
    }

    bundleIds.add(pageState.descriptionSpec.bundleId)

    await this.preloadTranslationPackage(currentLanguage, Array.from(bundleIds))
  }

  async toggleColorScheme() {
    const current = await first(this.colorScheme$) ?? this.getActualColorScheme()
    this.colorScheme$.next(current === 'light' ? 'dark' : 'light')
  }

  // We cannot afford to update _language$ directly without first fetching the translations.
  // If dozens of observables depend on the new language's translations, each one will throw an error.
  // The routing service would get flooded with errors while already struggling to render the error page
  // in a language it cannot handle.
  async changeLanguage(newLanguage: WebsiteLanguageId) {
    const currentPackage = this.gettext.getCurrentPackage()
    const bundleIds = currentPackage.map(({ bundleId }) => bundleId)
    await this.preloadTranslationPackage(newLanguage, bundleIds)
    this.gettext.updateLanguage(newLanguage)
  }

  async finalize() {
    await this.gettext.finalize()
    this.urlPath$.complete()
    this.sidebarCollapsed$.complete()
    this.colorScheme$.complete()
    this.loading$.complete()
  }
}
