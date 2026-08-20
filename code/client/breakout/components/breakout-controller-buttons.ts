import { button } from '../../../common/components/button.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom-properties.ts'
import { StateStore } from '../../../common/support/state-store.ts'
import { type IconLibraryId } from '../../../common/types/bundles.ts'
import { type Action } from '../../../common/types/typecons.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { getEventParams, handleLeftButtonDown, handleLeftButtonUp, handleRightButtonDown, handleRightButtonUp } from '../events.ts'
import { type IControllableGameState } from '../types.ts'

interface IBreakoutControllerButtonsState {
  worker: Worker
  controllableStateStore: StateStore<IControllableGameState>
}

export function breakoutControllerButtons({ worker, controllableStateStore }: IBreakoutControllerButtonsState, env: ClientWebsiteEnvironment) {
  return c.html('div', { class: 'breakout-controller-buttons' },
    c.factory(breakoutControllerButton,
      {
        class: 'breakout-controller-button-left',
        enabled: controllableStateStore.keyedObservables.virtualControls,
        iconLibraryId: 'core',
        iconName: 'chevron-left',

        pointerdown(event: PointerEvent) {
          handleLeftButtonDown(getEventParams(controllableStateStore, worker, env, event))
        },

        pointerup(event: PointerEvent) {
          handleLeftButtonUp(getEventParams(controllableStateStore, worker, env, event))
        },
      },
    ),

    c.factory(breakoutControllerButton,
      {
        class: 'breakout-controller-button-right',
        enabled: controllableStateStore.keyedObservables.virtualControls,
        iconLibraryId: 'core',
        iconName: 'chevron-right',

        pointerdown(event: PointerEvent) {
          handleRightButtonDown(getEventParams(controllableStateStore, worker, env, event))
        },

        pointerup(event: PointerEvent) {
          handleRightButtonUp(getEventParams(controllableStateStore, worker, env, event))
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
  pointerdown: Action<PointerEvent>
  pointerup: Action<PointerEvent>
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
