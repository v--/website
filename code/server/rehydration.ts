import { type ServerWebsiteEnvironment } from './environment.ts'
import { first } from '../common/observable.ts'
import { type IWebsitePageState } from '../common/types/page.ts'
import { type IRehydrationData } from '../common/types/rehydration.ts'

export async function encodeRehydrationData(pageState: IWebsitePageState, env: ServerWebsiteEnvironment): Promise<IRehydrationData> {
  const rehydrationData: IRehydrationData = {
    iconRefPackage: await first(env.iconStore.package$),
    translationPackage: await first(env.gettext.package$),
  }

  if (pageState.pageDataHydrationTag) {
    rehydrationData.pageData = { tag: pageState.pageDataHydrationTag, content: pageState.pageData }
  }

  return rehydrationData
}
