import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type IconLibraryId } from '../types/bundles.ts'
import { type Action } from '../types/typecons.ts'

interface IIconComponentState {
  name: string
  class?: string
  libId: IconLibraryId
  click?: Action<unknown>
}

export function icon(state: IIconComponentState) {
  const rootState = {
    class: classlist('icon', 'class' in state && state.class),
    click: state.click,
  }

  return c.svg('svg', rootState,
    c.svg('use', { href: `svg_libraries/${state.libId}.svg#${state.name}` }),
  )
}
