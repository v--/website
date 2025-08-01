import { breakout } from './components/breakout.ts'
import {
  BRICK_MAX_POWER,
  DEFAULT_GAME_STATE,
  EVOLUTION_FREQUENCY,
  KEY_CONTROL,
  KEY_DEBUG,
  KEY_LEFT_SECONDARY,
  KEY_RESET,
  KEY_RIGHT_SECONDARY,
} from './constants.ts'
import { getEventParams, handleResetButton } from './events.ts'
import { type IGameState } from './types.ts'
import { checkbox } from '../../common/components/checkbox.ts'
import { rich } from '../../common/components/rich.ts'
import { spacer } from '../../common/components/spacer.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state_store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { playgroundMenu } from '../core/components/playground_menu.ts'
import { spotlightPage } from '../core/components/spotlight_page.ts'
import { DEFAULT_FPS } from '../core/dom.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('breakout')
  const store = new StateStore<IGameState>(
    { ...DEFAULT_GAME_STATE, fps: DEFAULT_FPS, debug: false },
    env.pageUnload$,
  )

  return c.factory(spotlightPage,
    {
      class: 'breakout-page',
      stage: c.factory(breakout, { store }),
      menu: c.factory(playgroundMenu, undefined,
        c.factory(checkbox, {
          name: 'debug-mode',
          value: store.keyedObservables.debug,
          content: _('control.debug.label'),
          update(newValue: boolean) {
            store.update({ debug: newValue })
          },
        }),
        c.html('button', {
          class: 'button-danger',
          text: _('control.reset.label'),
          click(event: PointerEvent) {
            handleResetButton(getEventParams(store, env, event))
          },
        }),
      ),
    },
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
        },
      }),
    }),
  )
}
