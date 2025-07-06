import { FEDIVERSE_CREATOR_TAG } from './fediverse.ts'
import { iterOpenGraphTags } from './open_graph.ts'
import { type IMetaTag } from './types.ts'
import { type GetText } from '../../common/translation.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export function* iterMetaTags(gettext: GetText, pageState: IWebsitePageState): Generator<IMetaTag> {
  yield* iterOpenGraphTags(gettext, pageState)
  yield FEDIVERSE_CREATOR_TAG
}
