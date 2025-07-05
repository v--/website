import { loadingIndicator } from './loading_indicator.ts'
import { sidebar } from './sidebar.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { map } from '../observable.ts'
import { c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function body(state: IWebsitePageState, env: WebsiteEnvironment) {
  const bodyClasses$ = env.colorScheme$.pipe(
    map(function (colorScheme) {
      return classlist(colorScheme && `${colorScheme}-scheme`, env.isContentDynamic() ? 'dynamic-content' : 'static-content')
    }),
  )

  return c('body', { class: bodyClasses$ },
    c(sidebar, {
      sidebarId: state.sidebarId,
      language: env.language$,
      sidebarCollapsed: env.sidebarCollapsed$,
      colorScheme: env.colorScheme$,
    }),
    c(loadingIndicator, { loading: env.loading$ }),
    c('div', { class: 'page-scroll-container' },
      c(state.page, state),
    ),
  )
}
