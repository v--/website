import { body } from '../../common/components/body.ts'
import { title } from '../../common/components/title.ts'
import { type WebsiteEnvironment } from '../../common/environment.ts'
import { map } from '../../common/observable.ts'
import { Component, c } from '../../common/rendering/component.ts'
import { CANONICAL_LANGUAGE_STRING } from '../../common/translation.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { type IRehydrationData } from '../../common/types/rehydration.ts'

const DEFAULT_PREFETCHED: Component[] = []

interface IRootState {
  pageState: IWebsitePageState
  rehydrationData: IRehydrationData
}

export function root({ pageState, rehydrationData }: IRootState, env: WebsiteEnvironment) {
  const _ = env.gettext$
  const preloaded = pageState.preload?.map(({ href, contentType }) => c('link', { rel: 'preload', as: contentType, href })) ?? DEFAULT_PREFETCHED
  const canonicalLanguage$ = env.language$.pipe(
    map(lang => CANONICAL_LANGUAGE_STRING[lang]),
  )

  return c('html', { lang: canonicalLanguage$ },
    c('head', undefined,
      c(title, pageState),
      c('meta', { charset: 'UTF-8' }),
      c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      c('meta', { name: 'description', content: _(pageState.descriptionSpec) }),
      c('meta', { name: 'fediverse:creator', content: '@ianis@pub.ivasilev.net' }),
      c('link', { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.png' }),
      c('link', { rel: 'stylesheet', href: '/styles/core.css' }),
      c('script', { id: 'rehydrationData', type: 'application/json', text: JSON.stringify(rehydrationData) }),
      c('script', { type: 'module', src: '/code/client/core/index.js', defer: true }),
      // This "JavaScript-only" hack is based on https://stackoverflow.com/a/431554/2756776
      c('noscript', undefined,
        c('style', { text: '.require-javascript { display: none }' }),
      ),
      ...preloaded,
    ),

    c(body, pageState),
  )
}
