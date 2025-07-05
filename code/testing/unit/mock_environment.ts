import { MockServiceManager } from './mock_services.ts'
import { WebsiteEnvironment } from '../../common/environment.ts'
import { type ColorScheme } from '../../common/types/page.ts'

export class MockEnvironment extends WebsiteEnvironment {
  declare readonly services: MockServiceManager

  constructor() {
    super({
      services: new MockServiceManager(),
      language: 'en',
    })
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
