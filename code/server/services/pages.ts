import { placeholder } from '../../common/pages/placeholder.ts'
import { type IWebsitePageService } from '../../common/services.ts'
import { type PlaygroundPageId } from '../../common/types/bundles.ts'

export class ServerPageService implements IWebsitePageService {
  async retrievePlaygroundPage(_pageId: PlaygroundPageId) {
    return placeholder
  }

  async finalize() {}
}
