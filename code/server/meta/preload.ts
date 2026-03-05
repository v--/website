import { type IMetaLink } from './types.ts'
import { type IconLibraryId } from '../../common/types/bundles.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export function* iterIconLibIds(pageState: IWebsitePageState): Generator<IconLibraryId> {
  yield 'core'
  yield 'logo'

  if (pageState.iconLibIds) {
    yield* pageState.iconLibIds
  }
}

export function* iterPreloadLinks(_pageState: IWebsitePageState): Generator<IMetaLink> {
  // Browsers are, as of 2026, reluctant about preloading SVG libraries
  // https://geoffrich.net/posts/preloading-svgs/
  // for (const libId of iterIconLibIds(pageState)) {
  //   yield {
  //     rel: 'preload',
  //     as: 'image',
  //     href: `/svg_libraries/${libId}.svg`,
  //     type: 'image/svg+xml',
  //   }
  // }
}
