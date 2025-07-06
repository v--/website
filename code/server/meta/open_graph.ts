/*
 * Quoting https://ogp.me/
 * > The Open Graph Protocol enables any web page to become a rich object in a social graph.
 *
 * It requires adding metadata HTML tags.
 */

import { type IMetaTag } from './types.ts'
import { CANONICAL_LANGUAGE_STRING, type GetText, LANGUAGE_IDS } from '../../common/translation.ts'
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

  const currentLang = gettext.getCurrentLanguage()

  yield {
    name: 'og:image',
    content: `/images/previews/${currentLang}/${pageState.previewImageName}.png`,
  }

  for (const lang of LANGUAGE_IDS) {
    yield {
      name: lang === currentLang ? 'og:locale' : 'og:locale:alternate',
      content: CANONICAL_LANGUAGE_STRING[lang],
    }
  }
}
