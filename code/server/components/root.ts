import { body } from '../../common/components/body.ts'
import { title } from '../../common/components/title.ts'
import { WEBSITE_CANONICAL_URL } from '../../common/constants/url.ts'
import { type WebsiteEnvironment } from '../../common/environment.ts'
import { bcp47Encode } from '../../common/languages.ts'
import { map } from '../../common/observable.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { type IRehydrationData } from '../../common/types/rehydration.ts'
import { ROOT_TAG_PREFIX, iterMetaTags, iterPreloadLinks } from '../meta.ts'

interface IRootState {
  pageState: IWebsitePageState
  rehydrationData: IRehydrationData
}

export function root({ pageState, rehydrationData }: IRootState, env: WebsiteEnvironment) {
  const canonicalLanguage$ = env.gettext.language$.pipe(
    map(lang => bcp47Encode(lang)),
  )

  return c.html('html', { prefix: ROOT_TAG_PREFIX, lang: canonicalLanguage$ },
    c.html('head', undefined,
      c.factory(title, pageState),
      ...iterMetaTags(env.gettext, pageState).map(metaState => c.html('meta', metaState)),
      c.html('link', { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.png' }),
      c.html('link', { rel: 'stylesheet', href: '/styles/core.css' }),
      ...iterPreloadLinks(pageState).map(linkState => c.html('link', linkState)),
      pageState.canonicalUrlPath && c.html('link', { rel: 'canonical', href: WEBSITE_CANONICAL_URL + pageState.canonicalUrlPath.toString() }),
      c.html('script', { id: 'rehydrationData', type: 'application/json', text: JSON.stringify(rehydrationData) }),
      c.html('script', { type: 'module', src: '/code/client/preload.js' }),
      c.html('script', { type: 'module', src: '/code/client/runtime.js', defer: true }),
    ),

    c.factory(body, pageState),
  )
}
