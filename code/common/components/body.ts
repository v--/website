import { loadingIndicator } from './loading_indicator.ts'
import { sidebar } from './sidebar.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { map } from '../observable.ts'
import { sidebarToggle } from './sidebar_toggle.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function body(state: IWebsitePageState, env: WebsiteEnvironment) {
  const bodyClasses$ = env.colorScheme$.pipe(
    map(function (colorScheme) {
      return classlist(colorScheme && `${colorScheme}-scheme`, env.isContentDynamic() ? 'dynamic-content' : 'static-content')
    }),
  )

  return c.html('body', { class: bodyClasses$ },
    c.factory(sidebarToggle),
    c.factory(sidebar, {
      sidebarId: state.sidebarId,
      language: env.gettext.language$,
      sidebarCollapsed: env.sidebarCollapsed$,
      colorScheme: env.colorScheme$,
    }),
    c.factory(loadingIndicator, { loading: env.loading$ }),
    c.html('div', { class: 'page-scroll-container' },
      c.factory(state.page, state),
    ),
  )
}
