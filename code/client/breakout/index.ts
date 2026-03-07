import { breakout } from './components/breakout.ts'
import {
  BRICK_MAX_POWER,
  EVOLUTION_FREQUENCY,
  KEY_CONTROL,
  KEY_DEBUG,
  KEY_LEFT_SECONDARY,
  KEY_RESET,
  KEY_RIGHT_SECONDARY,
} from './constants.ts'
import { getEventParams, handleResetButton } from './events.ts'
import { DEFAULT_GAME_STATE } from './state.ts'
import { type IGameState } from './types.ts'
import { checkbox } from '../../common/components/checkbox.ts'
import { rich } from '../../common/components/rich.ts'
import { spacer } from '../../common/components/spacer.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state_store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { spotlightPage } from '../core/components/spotlight_page.ts'
import { DEFAULT_FPS, isLayoutCollapsed } from '../core/dom.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { breakoutControllerButtons } from './components/breakout_controller_buttons.ts'
import { button } from '../../common/components/button.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('breakout')
  const store = new StateStore<IGameState>(
    { ...DEFAULT_GAME_STATE, fps: DEFAULT_FPS, debug: false, virtualControls: isLayoutCollapsed() },
    env.pageUnload$,
  )

  return c.factory(spotlightPage,
    {
      rootClass: 'breakout-page',
      stage: () => c.factory(breakout, { store }),
      submenu: () => c.html('menu', { class: 'playground-submenu' },
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(checkbox, {
            buttonStyle: 'transparent',
            name: 'virtual-controls',
            value: store.keyedObservables.virtualControls,
            text: _('control.virtual_controls.label'),
            update(newValue: boolean) {
              store.update({ virtualControls: newValue })
            },
          }),
        ),
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(checkbox, {
            buttonStyle: 'transparent',
            name: 'debug-mode',
            value: store.keyedObservables.debug,
            text: _('control.debug.label'),
            update(newValue: boolean) {
              store.update({ debug: newValue })
            },
          }),
        ),
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(button, {
            buttonStyle: 'danger',
            text: _('control.reset.label'),
            click(event: PointerEvent) {
              handleResetButton(getEventParams(store, env, event))
            },
          }),
        ),
      ),
    },
    c.factory(breakoutControllerButtons, { store }),
    c.factory(spacer, { dynamics: 'mf' }),
    c.factory(rich, {
      rootTag: 'section',
      doc: _.rich$({
        key: 'text',
        context: {
          breakoutUrl: 'https://en.wikipedia.org/wiki/Breakout_(video_game)',
          keyControl: KEY_CONTROL,
          keyReset: KEY_RESET,
          keyDebug: KEY_DEBUG,
          keyLeftSecondary: KEY_LEFT_SECONDARY,
          keyRightSecondary: KEY_RIGHT_SECONDARY,
          evolutionFrequency: EVOLUTION_FREQUENCY,
          startingBrickCount: DEFAULT_GAME_STATE.bricks.length,
          brickMaxPower: BRICK_MAX_POWER,
          githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/breakout`,
          githubRenderingSystemUrl: `${GITHUB_PROJECT_CODE_URL}/common/rendering`,
        },
      }),
    }),
  )
}
