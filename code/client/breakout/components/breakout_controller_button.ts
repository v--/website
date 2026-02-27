import { icon } from '../../../common/components/icon.ts'
import { combineLatest, map } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { StateStore } from '../../../common/support/state_store.ts'
import { type IconRefId } from '../../../common/types/bundles.ts'
import { type Action } from '../../../common/types/typecons.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { type IGameState } from '../types.ts'

interface IBreakoutControllerButtonState {
  store: StateStore<IGameState>
  class: string
  iconRefId: IconRefId
  iconName: string
  pointerdown: Action<MouseEvent>
  pointerup: Action<MouseEvent>
}

export function breakoutControllerButton(
  {
    store,
    class: cssClass,
    iconRefId,
    iconName,
    pointerdown,
    pointerup,
  }: IBreakoutControllerButtonState,
  env: ClientWebsiteEnvironment,
) {
  return c.html('button',
    {
      class: combineLatest({
        virtualControls: store.keyedObservables.virtualControls,
        sidebarCollapsed: env.sidebarCollapsed$,
      }).pipe(
        map(function ({ virtualControls, sidebarCollapsed }) {
          return classlist(
            'breakout-controller-button',
            cssClass,
            virtualControls && 'breakout-controller-button-enabled',
            !sidebarCollapsed && 'breakout-controller-button-compact',
          )
        }),
      ),

      pointerdown, pointerup,
    },
    c.factory(icon, {
      class: 'breakout-controller-button-icon',
      refId: iconRefId,
      name: iconName,
    }),
  )
}
