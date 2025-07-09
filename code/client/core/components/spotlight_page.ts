import { type WebsiteEnvironment } from '../../../common/environment.ts'
import { type Component, createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'

interface ISpotlightPageState {
  class?: string
  stage: Component
  menu: Component
}

export function spotlightPage(
  { class: cssClass, stage, menu }: ISpotlightPageState,
  env: WebsiteEnvironment,
  children: Readonly<Component[]>,
) {
  return c.html('main', { class: classlist('spotlight-page', cssClass) },
    c.html('div', { class: 'spotlight-page-head' },
      c.html('div', { class: 'spotlight-page-aspect-ratio-box-wrapper' },
        c.html('div', { class: 'spotlight-page-aspect-ratio-box' }, stage),
      ),
    ),
    // This bridge is below the carefully crafted box with constant aspect ratio (and is not part of it).
    // It acts both as a navigation and, when partially hidden, as an indicator that there is scrollable content.
    c.html('div', { class: 'spotlight-page-bridge' }, c.html('hr'), menu),
    c.html('div', { class: 'spotlight-page-body' },
      ...children,
    ),
  )
}
