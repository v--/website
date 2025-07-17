/*
 * Quoting https://ogp.me/
 * > The Open Graph Protocol enables any web page to become a rich object in a social graph.
 *
 * It requires adding metadata HTML tags.
 */

import { type IMetaTag } from './types.ts'
import { WEBSITE_LANGUAGE_IDS, bcp47Encode } from '../../common/languages.ts'
import { type GetText } from '../../common/translation.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export const ROOT_TAG_PREFIX = 'og: http://ogp.me/ns#'

export function* iterOpenGraphTags(gettext: GetText, pageState: IWebsitePageState): Generator<IMetaTag> {
  yield {
    name: 'og:type',
    content: 'website',
  }

  yield {
    name: 'og:title',
    content: pageState.titleSegmentSpecs.map(spec => gettext.plain(spec)).join(' ⋅ '),
  }

  yield {
    name: 'og:url',
    content: pageState.urlPath.toString(),
  }

  const currentLang = gettext.getCurrentLanguage()

  yield {
    name: 'og:image',
    content: `/images/open_graph/${currentLang}/${pageState.ogImageName}.png`,
  }

  for (const lang of WEBSITE_LANGUAGE_IDS) {
    yield {
      name: lang === currentLang ? 'og:locale' : 'og:locale:alternate',
      content: bcp47Encode(lang, 'underscore'),
    }
  }
}
