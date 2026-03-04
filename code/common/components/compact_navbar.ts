import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { mainMenu } from './main_menu.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type NavigationId } from '../types/page.ts'

export interface INavbarState {
  navId?: NavigationId
}

export function compactNavbar({ navId }: INavbarState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')

  return c.html('div',
    {
      role: 'toolbar',
      class: 'compact-navbar main-menu-toolbar',
    },

    c.html('button',
      {
        class: 'compact-navbar-button compact-navbar-button-menu button-with-icon',
        command: 'show-modal',
        commandFor: 'compact-navbar-dialog',
      },
      c.factory(icon, {
        libId: 'core',
        name: 'solid/bars',
      }),
    ),

    c.html('button',
      {
        class: 'compact-navbar-button compact-navbar-button-color button-with-icon',
        disabled: !env.isContentDynamic(),
        async click() {
          await env.toggleColorScheme()
        },
      },
      c.factory(icon, {
        libId: 'core',
        name: 'solid/lightbulb',
      }),
    ),

    c.html('dialog', { id: 'compact-navbar-dialog', closedby: 'any', class: 'compact-navbar-dialog' },
      c.html('form', { class: 'compact-navbar-dialog-form', name: 'compact-navbar-dialog-form' },
        c.html('div', { class: 'wide-navbar-logo-box' },
          c.factory(icon, {
            libId: 'logo',
            name: 'logo',
            class: 'wide-navbar-logo',
          }),
        ),
        c.html('button',
          {
            class: 'compact-navbar-dialog-close-button button-with-icon',
            command: 'close',
            commandFor: 'compact-navbar-dialog',
            type: 'button',
          },
          c.factory(icon, {
            libId: 'core',
            name: 'solid/bars',
            class: 'compact-navbar-item compact-navbar-item',
          }),
          c.html('span', { text: _('main_menu.button.close_menu') }),
        ),
        c.html('hr'),
        c.factory(mainMenu, { navId }),
      ),
    ),
  )
}
