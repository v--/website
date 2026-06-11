import { icon } from './icon.ts'
import { createComponent as c } from '../rendering/component.ts'

export function mainMenuLogo(_state: unknown) {
  return c.html('div', { class: 'main-menu-logo-box' },
    c.factory(icon, {
      libId: 'logo',
      name: 'logo',
      class: 'main-menu-logo',
    }),
  )
}
