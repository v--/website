import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { button } from './button.ts'
import { mainMenu } from './main_menu.ts'
import { mainMenuLogo } from './main_menu_logo.ts'
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
        // Webkit only recently added support for `command` and `commandfor`, so we are stuck with manually showing the modal
        // TODO: Migrate to the attributes
        // command: 'show-modal',
        // commandfor: 'compact-navbar-dialog',
        click(_event: PointerEvent) {
          const dialog = document.body.querySelector('#compact-navbar-dialog')

          if (dialog instanceof HTMLDialogElement) {
            dialog.showModal()
          }
        },
      },
      c.factory(icon, {
        libId: 'core',
        name: 'menu',
      }),
    ),

    c.factory(button,
      {
        class: 'compact-navbar-button compact-navbar-button-color',
        disabled: !env.isContentDynamic(),
        iconLibId: 'core',
        iconName: 'lightbulb',
        async click() {
          await env.toggleColorScheme()
        },
      },
    ),

    c.html('dialog', { id: 'compact-navbar-dialog', closedby: 'any', class: 'compact-navbar-dialog' },
      c.html('form', { class: 'compact-navbar-dialog-form', name: 'compact-navbar-dialog-form' },
        c.factory(mainMenuLogo),
        c.factory(button, {
          class: 'compact-navbar-dialog-close-button',
          text: _('main_menu.button.close_menu'),
          iconLibId: 'core',
          iconName: 'menu',
          // Webkit only recently added support for `command` and `commandfor`, so we are stuck with manually showing the modal
          // TODO: Migrate to the attributes
          // command: 'close',
          // commandfor: 'compact-navbar-dialog',
          click(_event: PointerEvent) {
            const dialog = document.body.querySelector('#compact-navbar-dialog')

            if (dialog instanceof HTMLDialogElement) {
              dialog.close()
            }
          },
        }),
        c.html('hr'),
        c.factory(mainMenu, { navId }),
      ),
    ),
  )
}
