import { button } from '../../../common/components/button.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { StateStore } from '../../../common/support/state_store.ts'
import { type IconLibraryId } from '../../../common/types/bundles.ts'
import { type Action } from '../../../common/types/typecons.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { getEventParams, handleLeftButtonDown, handleLeftButtonUp, handleRightButtonDown, handleRightButtonUp } from '../events.ts'
import { type IGameState } from '../types.ts'

interface IBreakoutControllerButtonsState {
  store: StateStore<IGameState>
}

export function breakoutControllerButtons({ store }: IBreakoutControllerButtonsState, env: ClientWebsiteEnvironment) {
  return c.html('div',
    {
      id: 'breakout-controller-buttons',
      class: 'breakout-controller-buttons',
    },
    c.factory(breakoutControllerButton,
      {
        class: 'breakout-controller-button-left',
        enabled: store.keyedObservables.virtualControls,
        iconLibraryId: 'core',
        iconName: 'chevron-left',

        pointerdown(event: MouseEvent) {
          handleLeftButtonDown(getEventParams(store, env, event))
        },

        pointerup(event: MouseEvent) {
          handleLeftButtonUp(getEventParams(store, env, event))
        },
      },
    ),

    c.factory(breakoutControllerButton,
      {
        class: 'breakout-controller-button-right',
        enabled: store.keyedObservables.virtualControls,
        iconLibraryId: 'core',
        iconName: 'chevron-right',

        pointerdown(event: MouseEvent) {
          handleRightButtonDown(getEventParams(store, env, event))
        },

        pointerup(event: MouseEvent) {
          handleRightButtonUp(getEventParams(store, env, event))
        },
      },
    ),
  )
}

interface IBreakoutControllerButtonState {
  class: string
  enabled: boolean
  iconLibraryId: IconLibraryId
  iconName: string
  pointerdown: Action<MouseEvent>
  pointerup: Action<MouseEvent>
}

export function breakoutControllerButton(
  {
    class: cssClass,
    enabled,
    iconLibraryId,
    iconName,
    pointerdown,
    pointerup,
  }: IBreakoutControllerButtonState,
) {
  return c.factory(button,
    {
      class: classlist(
        'breakout-controller-button',
        enabled && 'breakout-controller-button-enabled',
        cssClass,
      ),
      pointerdown, pointerup,
      iconLibId: iconLibraryId,
      iconName: iconName,
    },
  )
}
