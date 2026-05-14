import { type IMetaTag } from './types.ts'
import { type GetText } from '../../common/translation.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export function* iterRobotsMetaTags(gettext: GetText, pageState: IWebsitePageState): Generator<IMetaTag> {
  if (!pageState.allowIndexing) {
    yield { name: 'robots', content: 'noindex' }
  }
}
