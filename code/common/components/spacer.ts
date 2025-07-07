import { createComponent as c } from '../rendering/component.ts'

export type SpacerOrientation = 'horizontal' | 'vertical'
export type SpacerDynamics = 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff'

interface ISpacerState {
  direction?: SpacerOrientation
  dynamics?: SpacerDynamics
}

export function spacer({ direction, dynamics }: ISpacerState = {}) {
  if (dynamics === undefined) {
    dynamics = direction === 'horizontal' ? 'mp' : 'f'
  }

  return c.html('div', { class: `spacer spacer-${direction ?? 'vertical'} spacer-dynamics-${dynamics}` })
}
