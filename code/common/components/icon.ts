import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type IconLibraryId } from '../types/bundles.ts'
import { type Action } from '../types/typecons.ts'

interface IIconContentComponentState {
  name: string
  class?: string
  libId: IconLibraryId
}

// Sometimes we need only the icon without an SVG wrapper. For example, WebKit refuses to apply scaling transforms to nested SVG elements.
export function iconContent({ libId, name, class: cssClass }: IIconContentComponentState) {
  return c.svg('use', {
    class: classlist('icon', cssClass),
    href: `/svg_libraries/${libId}.svg#${name}`,
  })
}

interface IIconComponentState {
  name: string
  class?: string
  libId: IconLibraryId
  click?: Action<unknown>
}

export function icon({ name, libId, click, class: cssClass }: IIconComponentState) {
  const rootState = {
    class: classlist('icon', cssClass),
    click: click,
  }

  return c.svg('svg', rootState,
    c.factory(iconContent, { name, libId }),
  )
}
