import { anchor } from '../../../common/components/anchor.ts'
import { button } from '../../../common/components/button.ts'
import { Component, type FactoryComponentType, createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { togglePopover } from '../dom.ts'
import { type ClientWebsiteEnvironment } from '../environment.ts'

interface IPlaygroundMenuState {
  submenu: FactoryComponentType<Component, ClientWebsiteEnvironment>
  stickTop?: boolean
  stickBottom?: boolean
}

export function playgroundMenu({ submenu, stickTop, stickBottom }: IPlaygroundMenuState) {
  return c.html('menu',
    {
      role: 'toolbar',
      class: classlist(
        'playground-menu',
        stickTop && 'playground-menu-stick-top',
        stickBottom && 'playground-menu-stick-bottom',
      ),
    },
    c.html('li', { class: 'playground-menu-head' },
      c.factory(anchor, {
        class: 'playground-menu-up-anchor',
        href: '/playground',
        buttonStyle: true,
        isInternal: true,
      }),
    ),
    c.html('li', { class: 'playground-menu-inline' },
      c.html('form', { name: 'playground-menu-inline-form' }, c.factory(submenu)),
    ),
    c.html('li', { class: 'playground-menu-drawer' },
      c.factory(button,
        {
          class: 'playground-menu-drawer-toggle',
          popovertarget: 'playground-menu-drawer-popover',
          iconLibId: 'core',
          iconName: 'menu',
        },
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

export function closeDrawer() {
  togglePopover('playground-menu-drawer-popover', false)
}
