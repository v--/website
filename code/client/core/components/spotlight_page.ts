import { type WebsiteEnvironment } from '../../../common/environment.ts'
import { type Component, type FactoryComponentType, createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { type ClientWebsiteEnvironment } from '../environment.ts'
import { playgroundMenu } from './playground_menu.ts'

interface ISpotlightPageState {
  rootClass?: string
  bodyClass?: string
  stage: FactoryComponentType<object, ClientWebsiteEnvironment>
  submenu: FactoryComponentType<object, ClientWebsiteEnvironment>
}

export function spotlightPage(
  { rootClass, bodyClass, stage, submenu }: ISpotlightPageState,
  env: WebsiteEnvironment,
  children: Readonly<Component[]>,
) {
  return c.html('main', { class: classlist('spotlight-page', rootClass) },
    c.html('div', { class: 'spotlight-page-head' },
      c.html('div', { class: 'spotlight-page-aspect-ratio-box-wrapper' },
        c.html('div', { class: 'spotlight-page-aspect-ratio-box' }, c.factory(stage)),
      ),
    ),
    // This bridge is below the carefully crafted box with constant aspect ratio (and is not part of it).
    // It acts both as a navigation and, when partially hidden, as an indicator that there is scrollable content.
    c.html('div', { class: 'spotlight-page-bridge' }, c.html('hr'), c.factory(playgroundMenu, { submenu, stickTop: true })),
    c.html('div', { class: classlist('spotlight-page-body', bodyClass) },
      ...children,
    ),
  )
}
