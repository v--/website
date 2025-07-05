import { type PlaygroundPageId } from '../types/bundles.ts'
import { type WebsitePage } from '../types/page.ts'

export interface IWebsitePageService {
  retrievePlaygroundPage(pageId: PlaygroundPageId): Promise<WebsitePage>
}
