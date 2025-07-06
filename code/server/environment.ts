import { type IServerServiceManager } from './services.ts'
import { type IEnvironmentConfig, WebsiteEnvironment } from '../common/environment.ts'
import { type IServiceManager } from '../common/services.ts'
import { type ColorScheme } from '../common/types/page.ts'

export interface IServerEnvironmentConfig extends IEnvironmentConfig {
  services: IServiceManager
}

export class ServerWebsiteEnvironment extends WebsiteEnvironment {
  declare readonly services: IServerServiceManager

  constructor(config: IServerEnvironmentConfig) {
    super(config)
  }

  override getActualColorScheme(): ColorScheme {
    return 'light'
  }

  override isSidebarActuallyCollapsed() {
    return false
  }

  override isContentDynamic() {
    return false
  }
}
