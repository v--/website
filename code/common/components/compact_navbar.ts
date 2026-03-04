import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { button } from './button.ts'
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

    c.factory(button,
      {
        class: 'compact-navbar-button compact-navbar-button-color',
        disabled: !env.isContentDynamic(),
        iconLibId: 'core',
        iconName: 'solid/lightbulb',
        async click() {
          await env.toggleColorScheme()
        },
      },
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
        c.factory(button, {
          class: 'compact-navbar-dialog-close-button',
          text: _('main_menu.button.close_menu'),
          command: 'close',
          commandfor: 'compact-navbar-dialog',
          iconLibId: 'core',
          iconName: 'solid/bars',
        }),
        c.html('hr'),
        c.factory(mainMenu, { navId }),
      ),
    ),
  )
}
