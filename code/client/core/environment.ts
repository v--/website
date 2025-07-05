import { getActualColorScheme, isSidebarActuallyCollapsed } from './dom.ts'
import { ClientLogger } from './logger.ts'
import { ClientServiceManager } from './services.ts'
import { type IEnvironmentConfig, WebsiteEnvironment } from '../../common/environment.ts'
import { Subject } from '../../common/observable.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export interface IClientEnvironmentConfig extends IEnvironmentConfig {
  services: ClientServiceManager
}

export class ClientWebsiteEnvironment extends WebsiteEnvironment {
  declare readonly services: ClientServiceManager
  readonly logger: ClientLogger
  readonly pageUnload$ = new Subject<void>()

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
    this.pageUnload$.next()
    await this.services.processPageState(pageState)
  }

  override async finalize() {
    this.pageUnload$.next()
    this.pageUnload$.complete()
    await this.services.finalize()
  }
}
