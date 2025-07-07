import { IntegrityError } from '../../common/errors.ts'
import { type IWebsitePageService } from '../../common/services.ts'
import { type PlaygroundPageId } from '../../common/types/bundles.ts'
import { type WebsitePage } from '../../common/types/page.ts'

export class ServerPageService implements IWebsitePageService {
  retrievePlaygroundPage(_pageId: PlaygroundPageId): Promise<WebsitePage> {
    throw new IntegrityError('We should not resolve a playground page on the server')
  }

  async finalize() {}
}
