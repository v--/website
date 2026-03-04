import { anchor } from '../../../common/components/anchor.ts'
import { icon } from '../../../common/components/icon.ts'
import { Component, type FactoryComponentType, createComponent as c } from '../../../common/rendering/component.ts'
import { type ClientWebsiteEnvironment } from '../environment.ts'

interface IPlaygroundMenuState {
  submenu: FactoryComponentType<Component, ClientWebsiteEnvironment>
}

export function playgroundMenu({ submenu }: IPlaygroundMenuState) {
  return c.html('menu',
    {
      class: 'playground-menu',
      role: 'toolbar',
    },
    c.html('li', { class: 'playground-menu-head' },
      c.factory(anchor, { class: 'playground-menu-up-anchor button-styled-anchor button-transparent', href: '/playground', isInternal: true }),
    ),
    c.html('li', { class: 'playground-menu-inline' },
      c.html('form', { name: 'playground-menu-inline-form' }, c.factory(submenu)),
    ),
    c.html('li', { class: 'playground-menu-drawer' },
      c.html('button',
        {
          class: 'playground-menu-drawer-toggle button-transparent button-with-icon',
          popovertarget: 'playground-menu-drawer-popover',
          type: 'button',
        },
        c.factory(icon, {
          libId: 'core',
          name: 'solid/bars',
        }),
      ),
      c.html('form',
        {
          popover: true,
          id: 'playground-menu-drawer-popover',
          class: 'playground-menu-drawer-popover',
          name: 'playground-menu-drawer-form',
        },
        c.factory(submenu),
      ),
    ),
  )
}
