import { button } from '../../../common/components/button.ts'
import { combineLatest, map } from '../../../common/observable.ts'
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
  return c.html('div', { class: 'breakout-controller-buttons' },
    c.html('div', { class: 'breakout-controller-button-wrapper-left' },
      c.factory(breakoutControllerButton,
        {
          store,
          class: 'breakout-controller-button-left',
          iconLibraryId: 'core',
          iconName: 'solid/chevron-left',

          pointerdown(event: MouseEvent) {
            handleLeftButtonDown(getEventParams(store, env, event))
          },

          pointerup(event: MouseEvent) {
            handleLeftButtonUp(getEventParams(store, env, event))
          },
        },
      ),
    ),

    c.html('div', { class: 'breakout-controller-button-wrapper-right' },
      c.factory(breakoutControllerButton,
        {
          store,
          class: 'breakout-controller-button-right',
          iconLibraryId: 'core',
          iconName: 'solid/chevron-right',

          pointerdown(event: MouseEvent) {
            handleRightButtonDown(getEventParams(store, env, event))
          },

          pointerup(event: MouseEvent) {
            handleRightButtonUp(getEventParams(store, env, event))
          },
        },
      ),
    ),
  )
}

interface IBreakoutControllerButtonState {
  store: StateStore<IGameState>
  class: string
  iconLibraryId: IconLibraryId
  iconName: string
  pointerdown: Action<MouseEvent>
  pointerup: Action<MouseEvent>
}

export function breakoutControllerButton(
  {
    store,
    class: cssClass,
    iconLibraryId,
    iconName,
    pointerdown,
    pointerup,
  }: IBreakoutControllerButtonState,
  env: ClientWebsiteEnvironment,
) {
  return c.factory(button,
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
      iconLibId: iconLibraryId,
      iconName: iconName,
    },
  )
}
