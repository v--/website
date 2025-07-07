import { anchor } from '../../../common/components/anchor.ts'
import { checkbox } from '../../../common/components/checkbox.ts'
import { icon } from '../../../common/components/icon.ts'
import { BehaviorSubject, map, takeUntil } from '../../../common/observable.ts'
import { Component, createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { type ClientWebsiteEnvironment } from '../environment.ts'

interface IFocusedPageState {
  class?: string
}

export function playgroundMenu(
  { class: cssClass }: IFocusedPageState = {},
  env: ClientWebsiteEnvironment,
  children: Component[],
) {
  const expanded$ = new BehaviorSubject(false)

  return c.html('menu',
    {
      class: expanded$.pipe(
        takeUntil(env.pageUnload$),
        map(expanded => classlist('playground-menu', cssClass, expanded && 'playground-menu-expanded')),
      ),
    },
    c.html('li', { class: 'playground-menu-head' },
      c.html('div', { class: 'playground-menu-up-anchor-wrapper' },
        c.factory(anchor, { class: 'playground-menu-up-anchor button-styled-anchor', href: '/playground', isInternal: true }),
      ),

      c.factory(checkbox, {
        name: 'playground_menu_toggle',
        labelClass: 'playground-menu-toggle-label',
        inputClass: 'playground-menu-toggle-control',
        value: expanded$.pipe(takeUntil(env.pageUnload$)),
        content: c.html('button', { class: 'playground-menu-toggle-button' },
          c.factory(icon, { refId: 'playground_menu', name: 'solid/ellipsis-vertical' }),
        ),
        update(newValue: boolean) {
          expanded$.next(newValue)
        },
      }),
    ),
    c.html('li', { class: 'playground-menu-rest' }, ...children),
  )
}
