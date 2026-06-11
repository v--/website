import { mainMenuLogo } from './main-menu-logo.ts'
import { mainMenu } from './main-menu.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type NavigationId } from '../types/page.ts'

interface IMainMenuState {
  navId?: NavigationId
}

export function wideNavbar({ navId }: IMainMenuState) {
  return c.html('aside', { class: 'wide-navbar main-menu-toolbar', role: 'toolbar' },
    c.factory(mainMenuLogo),
    c.html('form', { class: 'wide-navbar-form', name: 'wide-navbar-form' },
      c.factory(mainMenu, { navId }),
    ),
  )
}
