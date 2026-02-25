import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'

interface ISidebarState {
  sidebarCollapsed: boolean
}

export function sidebarToggle({ sidebarCollapsed }: ISidebarState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')
  const classes = classlist(
    'sidebar-toggle',
    sidebarCollapsed === undefined ? undefined : (sidebarCollapsed ? 'sidebar-toggle-collapsed' : 'sidebar-toggle-expanded'),
  )

  return c.html('button',
    {
      class: classes,
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
