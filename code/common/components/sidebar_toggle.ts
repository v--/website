import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'

export function sidebarToggle(_state: unknown, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')

  return c.html('button',
    {
      class: 'sidebar-toggle require-javascript',
      disabled: !env.isContentDynamic(),
      title: _('sidebar.button.expand'),
      click() {
        env.sidebarCollapsed$.next(false)
      },
    },
    c.factory(icon, {
      refId: 'core',
      name: 'solid/chevron-right',
    }),
  )
}
