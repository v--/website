import { getActualColorScheme, isSidebarActuallyCollapsed } from './dom.ts'
import { ClientLogger } from './logger.ts'
import { ClientServiceManager } from './services.ts'
import { type IEnvironmentConfig, WebsiteEnvironment } from '../../common/environment.ts'
import { Subject, first } from '../../common/observable.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export interface IClientEnvironmentConfig extends IEnvironmentConfig {
  services: ClientServiceManager
  logger: ClientLogger
}

export class ClientWebsiteEnvironment extends WebsiteEnvironment {
  declare readonly services: ClientServiceManager
  readonly pageUnload$ = new Subject<void>()
  #sidebarInitiallyCollapsed: boolean

  constructor(config: IClientEnvironmentConfig) {
    super(config)
    this.#sidebarInitiallyCollapsed = isSidebarActuallyCollapsed()
  }

  override isSidebarActuallyCollapsed = isSidebarActuallyCollapsed
  override getActualColorScheme = getActualColorScheme

  override isContentDynamic() {
    return true
  }

  async processPageChange(pageState: IWebsitePageState) {
    this.pageUnload$.next()
    await super.preloadPageData(pageState)

    // Collapse sidebar on navigation on small and medium screens
    if (this.#sidebarInitiallyCollapsed && await first(this.sidebarCollapsed$) !== undefined) {
      this.sidebarCollapsed$.next(true)
    }

    this.sidebarTogglePosition$.next(undefined)
  }

  override async finalize() {
    this.pageUnload$.next()
    this.pageUnload$.complete()
    await this.services.finalize()
  }
}
