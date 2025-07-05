import { BehaviorSubject, Observable, ReplaySubject, Subject, switchMap } from './observable.ts'
import { type IEncodedError } from './presentable_errors/types.ts'
import { type IRichTextDocument } from './rich.ts'
import { type IServiceManager } from './services.ts'
import { type UrlPath } from './support/url_path.ts'
import { type IDelayedTranslator } from './translation/gettext.ts'
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
  readonly gettext: IDelayedTranslator
  readonly gettext$: IContinuousTranslator
  readonly language$: BehaviorSubject<LanguageId>
  readonly urlPath$ = new Subject<UrlPath>()
  readonly sidebarCollapsed$ = new ReplaySubject<boolean | undefined>()
  readonly colorScheme$ = new ReplaySubject<ColorScheme | undefined>()
  readonly loading$ = new ReplaySubject<boolean>()

  constructor(config: IEnvironmentConfig) {
    this.services = config.services
    this.language$ = new BehaviorSubject(config.language)
    this.colorScheme$.next(config.colorScheme)
    this.sidebarCollapsed$.next(config.sidebarCollapsed)
    this.loading$.next(config.loading ?? false)
    this.gettext = this._gettext.bind(this)
    this.gettext$ = this._gettext$.bind(this)
  }

  abstract getActualColorScheme(): ColorScheme
  abstract isSidebarActuallyCollapsed(): boolean
  abstract isContentDynamic(): boolean

  protected async _gettextImpl(lang: LanguageId, spec: ITranslationSpec): Promise<string>
  protected async _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): Promise<string>
  protected async _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options: IGettextOptions & { rich: true }): Promise<IRichTextDocument>
  protected async _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options?: IGettextOptions): Promise<string | IRichTextDocument>
  protected async _gettextImpl(lang: LanguageId, spec: ITranslationSpec, options?: IGettextOptions): Promise<string | IRichTextDocument> {
    // We don't use preloaded maps here because that would break when changing the language
    const translationMap = await this.services.translation.getTranslationMap(spec.bundleId, lang)

    return gettext({
      translationMap,
      key: spec.key,
      context: spec.context,
      options,
    })
  }

  protected async _gettext(spec: ITranslationSpec): Promise<string>
  protected async _gettext(spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): Promise<string>
  protected async _gettext(spec: ITranslationSpec, options: IGettextOptions & { rich: true }): Promise<IRichTextDocument>
  protected async _gettext(spec: ITranslationSpec, options?: IGettextOptions): Promise<string | IRichTextDocument>
  protected async _gettext(spec: ITranslationSpec, options?: IGettextOptions): Promise<string | IRichTextDocument> {
    return this._gettextImpl(this.language$.value, spec, options)
  }

  protected _gettext$(spec: ITranslationSpec): Observable<string>
  protected _gettext$(spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): Observable<string>
  protected _gettext$(spec: ITranslationSpec, options: IGettextOptions & { rich: true }): Observable<IRichTextDocument>
  protected _gettext$(spec: ITranslationSpec, options?: IGettextOptions): Observable<string | IRichTextDocument>
  protected _gettext$(spec: ITranslationSpec, options?: IGettextOptions): Observable<string | IRichTextDocument> {
    return this.language$.pipe(
      switchMap(async lang => {
        return this._gettextImpl(lang, spec, options)
      }),
    )
  }

  createPresentableError(encoded: IEncodedError) {
    return this.services.translation.errorFactory.create(encoded)
  }

  async finalize() {
    this.urlPath$.complete()
    this.language$.complete()
    this.sidebarCollapsed$.complete()
    this.colorScheme$.complete()
    this.loading$.complete()
  }
}
