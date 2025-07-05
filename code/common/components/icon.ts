import { type WebsiteEnvironment } from '../environment.ts'
import { IntegrityError } from '../errors.ts'
import { s } from '../rendering/component.ts'
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
  const iconMap = env.services.icons.getPreloadedIconRef(state.refId)

  if (!(state.name in iconMap)) {
    throw new IntegrityError(`Invalid icon ${state.name}`)
  }

  const spec = iconMap[state.name]

  const rootState = {
    viewBox: spec.viewBox,
    class: classlist('icon', 'class' in state && state.class),
    click: state.click,
  }

  return s('svg', rootState,
    s('path', { d: spec.path }),
  )
}
