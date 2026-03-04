import { icon } from './icon.ts'
import { mainMenu } from './main_menu.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type NavigationId } from '../types/page.ts'

interface IMainMenuState {
  navId?: NavigationId
}

export function wideNavbar({ navId }: IMainMenuState) {
  return c.html('aside', { class: 'wide-navbar main-menu-toolbar', role: 'toolbar' },
    c.html('div', { class: 'wide-navbar-logo-box' },
      c.factory(icon, {
        libId: 'logo',
        name: 'logo',
        class: 'wide-navbar-logo',
      }),
    ),
    c.html('form', { class: 'wide-navbar-form', name: 'wide-navbar-form' },
      c.factory(mainMenu, { navId }),
    ),
  )
}
