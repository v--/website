/*
 * Quoting https://ogp.me/
 * > The Open Graph Protocol enables any web page to become a rich object in a social graph.
 *
 * It requires adding metadata HTML tags.
 */

import { type IMetaTag } from './types.ts'
import { type GetText } from '../../common/translation.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export function* iterOpenGraphTags(gettext: GetText, pageState: IWebsitePageState): Generator<IMetaTag> {
  yield {
    name: 'og:type',
    content: 'website',
  }

  yield {
    name: 'og:title',
    content: gettext.plain(pageState.titleSpec),
  }

  yield {
    name: 'og:url',
    content: pageState.urlPath.trimQueryString().toString(),
  }

  const lang = gettext.getCurrentLanguage()

  yield {
    name: 'og:image',
    content: `/images/previews/${lang}/${pageState.previewImageName}.png`,
  }
}
