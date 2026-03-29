import { anchor } from '../../../common/components/anchor.ts'
import { button } from '../../../common/components/button.ts'
import { Component, type FactoryComponentType, createComponent as c } from '../../../common/rendering/component.ts'
import { waitForNextTask } from '../../../common/support/async.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { toggleModalDialog } from '../dom.ts'
import { type ClientWebsiteEnvironment } from '../environment.ts'

interface IPlaygroundMenuState {
  submenu: FactoryComponentType<Component, ClientWebsiteEnvironment>
  stickTop?: boolean
  stickBottom?: boolean
}

export function playgroundMenu({ submenu, stickTop, stickBottom }: IPlaygroundMenuState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')

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
          class: 'playground-menu-drawer-button-open',
          iconLibId: 'core',
          iconName: 'menu',
          command: 'show-modal',
          commandfor: 'playground-menu-drawer-dialog',
          // Webkit only recently added support for `command` and `commandfor`, so we are stuck with manually showing the modal
          // TODO: Remove click handler
          async click(_event: PointerEvent) {
            await waitForNextTask()
            await toggleModalDialog('playground-menu-drawer-dialog', true)
          },
        },
      ),
      c.html('dialog',
        {
          id: 'playground-menu-drawer-dialog',
          class: 'playground-menu-drawer-dialog',
          closedby: 'any',
        },
        c.html('form', { name: 'playground-menu-drawer-form' },
          c.factory(submenu),
          c.factory(button,
            {
              class: 'playground-menu-drawer-button-close',
              buttonStyle: 'transparent',
              text: _('main_menu.button.close_menu'),
              command: 'close',
              commandfor: 'playground-menu-drawer-dialog',
              async click(_event: PointerEvent) {
                await waitForNextTask()
                await toggleModalDialog('playground-menu-drawer-dialog', false)
              },
            },
          ),
        ),
      ),
    ),
  )
}
