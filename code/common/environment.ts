import { BehaviorSubject, Observable, ReplaySubject, Subject, map } from './observable.ts'
import { type IEncodedError } from './presentable_errors/types.ts'
import { type IRichTextDocument } from './rich.ts'
import { type IServiceManager } from './services.ts'
import { type UrlPath } from './support/url_path.ts'
import { type ITranslator } from './translation/gettext.ts'
import { type IContinuousTranslator, type IGettextOptions, type ITranslationSpec, type LanguageId, gettext } from './translation.ts'
import { type IFinalizeable } from './types/finalizable.ts'
import { type ColorScheme } from './types/page.ts'

export interface IEnvironmentConfig {
  services: IServiceManager
  language: LanguageId
  colorScheme?: ColorScheme
  sidebarCollapsed?: boolean
  loading?: boolean
}

export abstract class WebsiteEnvironment implements IFinalizeable {
  readonly services: IServiceManager
  readonly gettext: ITranslator
  readonly gettext$: IContinuousTranslator
  protected readonly _language$: BehaviorSubject<LanguageId>
  readonly language$: Observable<LanguageId>
  readonly urlPath$ = new Subject<UrlPath>()
  readonly sidebarCollapsed$ = new ReplaySubject<boolean | undefined>()
  readonly colorScheme$ = new ReplaySubject<ColorScheme | undefined>()
  readonly loading$ = new ReplaySubject<boolean>()

  constructor(config: IEnvironmentConfig) {
    this.services = config.services
    this._language$ = new BehaviorSubject(config.language)
    this.language$ = this._language$
    this.colorScheme$.next(config.colorScheme)
    this.sidebarCollapsed$.next(config.sidebarCollapsed)
    this.loading$.next(config.loading ?? false)
    this.gettext = this._gettext.bind(this)
    this.gettext$ = this._gettext$.bind(this)
  }

  abstract getActualColorScheme(): ColorScheme
  abstract isSidebarActuallyCollapsed(): boolean
  abstract isContentDynamic(): boolean
  abstract processLanguageChange(newLanguage: LanguageId): Promise<void>

  // We cannot afford to update _language$ directly without first fetching the translations.
  // If dozens of observables depend on the new language's translations, each one will throw an error.
  // The routing service would get flooded with errors while already struggling to render the error page
  // in a language it cannot handle.
  async changeLanguage(newLanguage: LanguageId) {
    await this.processLanguageChange(newLanguage)
    this._language$.next(newLanguage)
  }

  getCurrentLanguage() {
    return this._language$.value
  }

  protected _gettextImpl(lang: LanguageId, spec: ITranslationSpec): string
  protected _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): string
  protected _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options: IGettextOptions & { rich: true }): IRichTextDocument
  protected _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options?: IGettextOptions): string | IRichTextDocument
  protected _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options?: IGettextOptions): string | IRichTextDocument {
    const translationMap = this.services.translation.getPreloadedTranslationMap(spec.bundleId, lang)

    return gettext({
      translationMap,
      key: spec.key,
      context: spec.context,
      options,
    })
  }

  protected _gettext(spec: ITranslationSpec): string
  protected _gettext(spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): string
  protected _gettext(spec: ITranslationSpec, options: IGettextOptions & { rich: true }): IRichTextDocument
  protected _gettext(spec: ITranslationSpec, options?: IGettextOptions): string | IRichTextDocument
  protected _gettext(spec: ITranslationSpec, options?: IGettextOptions): string | IRichTextDocument {
    return this._gettextImpl(this.getCurrentLanguage(), spec, options)
  }

  protected _gettext$(spec: ITranslationSpec): Observable<string>
  protected _gettext$(spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): Observable<string>
  protected _gettext$(spec: ITranslationSpec, options: IGettextOptions & { rich: true }): Observable<IRichTextDocument>
  protected _gettext$(spec: ITranslationSpec, options?: IGettextOptions): Observable<string | IRichTextDocument>
  protected _gettext$(spec: ITranslationSpec, options?: IGettextOptions): Observable<string | IRichTextDocument> {
    return this._language$.pipe(
      map(lang => this._gettextImpl(lang, spec, options)),
    )
  }

  createPresentableError(encoded: IEncodedError) {
    return this.services.translation.errorFactory.create(encoded)
  }

  async finalize() {
    this.urlPath$.complete()
    this.sidebarCollapsed$.complete()
    this._language$.complete()
    this.colorScheme$.complete()
    this.loading$.complete()
  }
}
