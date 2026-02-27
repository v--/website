import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { combineLatest, first, map } from '../observable.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'

export function sidebarToggle(_state: unknown, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')
  const rootClasses$ = combineLatest({
    position: env.sidebarTogglePosition$,
    sidebarCollapsed: env.sidebarCollapsed$,
  }).pipe(
    map(function ({ position, sidebarCollapsed }) {
      return classlist(
        'require-javascript',
        'sidebar-toggle',
        position === 'center' && 'sidebar-toggle-center',
        sidebarCollapsed === false && 'sidebar-toggle-expanded',
      )
    }),
  )

  return c.html('button',
    {
      class: rootClasses$,
      disabled: !env.isContentDynamic(),
      title: _('sidebar.button.expand'),
      async click() {
        const current = await first(env.sidebarCollapsed$) ?? env.isSidebarActuallyCollapsed()
        env.sidebarCollapsed$.next(!current)
      },
    },
    c.factory(icon, {
      refId: 'core',
      name: 'solid/bars',
    }),
  )
}
