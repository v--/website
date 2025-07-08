import { getActualColorScheme, isSidebarActuallyCollapsed } from './dom.ts'
import { ClientLogger } from './logger.ts'
import { ClientServiceManager } from './services.ts'
import { type IEnvironmentConfig, WebsiteEnvironment } from '../../common/environment.ts'
import { Subject } from '../../common/observable.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export interface IClientEnvironmentConfig extends IEnvironmentConfig {
  services: ClientServiceManager
  logger: ClientLogger
}

export class ClientWebsiteEnvironment extends WebsiteEnvironment {
  declare readonly services: ClientServiceManager
  readonly pageUnload$ = new Subject<void>()

  constructor(config: IClientEnvironmentConfig) {
    super(config)
  }

  override isSidebarActuallyCollapsed = isSidebarActuallyCollapsed
  override getActualColorScheme = getActualColorScheme

  override isContentDynamic() {
    return true
  }

  async processPageChange(pageState: IWebsitePageState) {
    this.pageUnload$.next()
    await super.preloadPageData(pageState)
  }

  override async finalize() {
    this.pageUnload$.next()
    this.pageUnload$.complete()
    await this.services.finalize()
  }
}
