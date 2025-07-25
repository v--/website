import { type WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type IconRefId } from '../types/bundles.ts'
import { type Action } from '../types/typecons.ts'

interface IIconComponentState {
  name: string
  class?: string
  refId: IconRefId
  click?: Action<unknown>
}

export function icon(state: IIconComponentState, env: WebsiteEnvironment) {
  const spec = env.iconStore.getIconSpec(state.refId, state.name)

  const rootState = {
    viewBox: spec.viewBox,
    class: classlist('icon', 'class' in state && state.class),
    click: state.click,
  }

  return c.svg('svg', rootState,
    c.svg('path', { d: spec.path }),
  )
}
