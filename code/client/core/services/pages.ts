import { type IWebsitePageService } from '../../../common/services.ts'
import { type PlaygroundPageId } from '../../../common/types/bundles.ts'
import { type WebsitePage } from '../../../common/types/page.ts'
import { loadPlaygroundPage } from '../dom.ts'

export class ClientPageService implements IWebsitePageService {
  #cache = new Map<PlaygroundPageId, WebsitePage>()

  async retrievePlaygroundPage(pageId: PlaygroundPageId) {
    let page = this.#cache.get(pageId)

    if (page === undefined) {
      page = await loadPlaygroundPage(pageId)
      this.#cache.set(pageId, page)
    }

    return page
  }

  async finalize() {}
}
