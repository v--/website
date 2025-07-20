import { body } from '../../common/components/body.ts'
import { title } from '../../common/components/title.ts'
import { type WebsiteEnvironment } from '../../common/environment.ts'
import { bcp47Encode } from '../../common/languages.ts'
import { map } from '../../common/observable.ts'
import { Component, createComponent as c } from '../../common/rendering/component.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { type IRehydrationData } from '../../common/types/rehydration.ts'
import { ROOT_TAG_PREFIX, iterMetaTags } from '../meta.ts'

const DEFAULT_PREFETCHED: Component[] = []

interface IRootState {
  pageState: IWebsitePageState
  rehydrationData: IRehydrationData
}

export function root({ pageState, rehydrationData }: IRootState, env: WebsiteEnvironment) {
  const preloaded = pageState.preload?.map(({ href, contentType }) => c.html('link', { rel: 'preload', as: contentType, href })) ?? DEFAULT_PREFETCHED
  const canonicalLanguage$ = env.gettext.language$.pipe(
    map(lang => bcp47Encode(lang)),
  )

  return c.html('html', { prefix: ROOT_TAG_PREFIX, lang: canonicalLanguage$ },
    c.html('head', undefined,
      c.factory(title, pageState),
      // TODO: Remove Array.from once Iterator.prototype.map() proliferates
      ...Array.from(iterMetaTags(env.gettext, pageState)).map(
        tag => c.html('meta', { name: tag.name, content: tag.content }),
      ),
      c.html('link', { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.png' }),
      c.html('link', { rel: 'stylesheet', href: '/styles/core.css' }),
      pageState.canonicalUrlPath && c.html('link', { rel: 'canonical', href: pageState.canonicalUrlPath.toString() }),
      c.html('script', { id: 'rehydrationData', type: 'application/json', text: JSON.stringify(rehydrationData) }),
      c.html('script', { type: 'module', src: '/code/client/core/index.js', defer: true }),
      // This "JavaScript-only" hack is based on https://stackoverflow.com/a/431554/2756776
      c.html('noscript', undefined,
        c.html('style', { text: '.require-javascript { display: none }' }),
      ),
      ...preloaded,
    ),

    c.factory(body, pageState),
  )
}
