import { getActualColorScheme, isSidebarActuallyCollapsed } from './dom.ts'
import { ClientLogger } from './logger.ts'
import { ClientServiceManager } from './services.ts'
import { type IEnvironmentConfig, WebsiteEnvironment } from '../../common/environment.ts'
import { ReplaySubject, Subject, first } from '../../common/observable.ts'
import { type LanguageId } from '../../common/translation.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export interface IClientEnvironmentConfig extends IEnvironmentConfig {
  services: ClientServiceManager
}

export class ClientWebsiteEnvironment extends WebsiteEnvironment {
  declare readonly services: ClientServiceManager
  readonly logger: ClientLogger
  readonly pageUnload$ = new Subject<void>()
  readonly #pageState$ = new ReplaySubject<IWebsitePageState>()

  constructor(logger: ClientLogger, config: IClientEnvironmentConfig) {
    super(config)
    this.logger = logger
  }

  override isSidebarActuallyCollapsed = isSidebarActuallyCollapsed
  override getActualColorScheme = getActualColorScheme

  override isContentDynamic() {
    return true
  }

  async processPageState(pageState: IWebsitePageState) {
    this.#pageState$.next(pageState)
    this.pageUnload$.next()
    await this.services.processPageState(pageState, this.getCurrentLanguage())
  }

  override async processLanguageChange(newLanguage: LanguageId) {
    const pageState = await first(this.#pageState$)
    await this.services.preloadTranslations(pageState, newLanguage)
  }

  override async finalize() {
    this.pageUnload$.next()
    this.pageUnload$.complete()
    this.#pageState$.complete()
    await this.services.finalize()
  }
}
