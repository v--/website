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
import { type WorkerToHostMessage } from './messages.ts'
import { DEFAULT_CONTROLLABLE_GAME_STATE, DEFAULT_INTERNAL_GAME_STATE } from './state.ts'
import { type IControllableGameState, type IInternalGameState } from './types.ts'
import { checkbox } from '../../common/components/checkbox.ts'
import { rich } from '../../common/components/rich.ts'
import { spacer } from '../../common/components/spacer.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { takeUntil } from '../../common/observable.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state-store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { spotlightPage } from '../core/components/spotlight-page.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { breakoutControllerButtons } from './components/breakout-controller-buttons.ts'
import { button } from '../../common/components/button.ts'
import { closeDrawer } from '../core/components/playground-menu.ts'
import { fromEvent, isLayoutCollapsed } from '../core/dom.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('breakout')

  const internalStateStore = new StateStore<IInternalGameState>(DEFAULT_INTERNAL_GAME_STATE, env.pageUnload$)
  const controllableStateStore = new StateStore<IControllableGameState>(
    { ...DEFAULT_CONTROLLABLE_GAME_STATE, virtualControls: isLayoutCollapsed() },
    env.pageUnload$,
  )

  const worker = new Worker(new URL('worker.js', import.meta.url), { type: 'module' })
  const subscription = env.pageUnload$.subscribe(() => {
    worker.terminate()
    subscription.unsubscribe()
  })

  controllableStateStore.stateUpdate$.subscribe(function (state) {
    worker.postMessage({ kind: 'stateUpdate', update: state })
  })

  fromEvent(worker, 'message').pipe(
    takeUntil(env.pageUnload$),
  ).subscribe({
    next: function (event: MessageEvent<WorkerToHostMessage>) {
      const message = event.data

      switch (message.kind) {
        case 'stateUpdate':
          internalStateStore.update(message.update)
          break

        case 'gameOver':
          controllableStateStore.setState('phase', 'game-over')
          break

        case 'gameCompleted':
          controllableStateStore.setState('phase', 'completed')
          break
      }
    },
  })

  return c.factory(spotlightPage,
    {
      rootClass: 'breakout-page',
      stage: () => c.factory(breakout, { worker, internalStateStore, controllableStateStore }),
      submenu: () => c.html('menu', { class: 'playground-submenu' },
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(checkbox, {
            buttonStyle: 'transparent',
            name: 'virtual-controls',
            value: controllableStateStore.keyedObservables.virtualControls,
            text: _('control.virtual-controls.label'),
            update(newValue: boolean) {
              controllableStateStore.update({ virtualControls: newValue })
            },
          }),
        ),
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(checkbox, {
            buttonStyle: 'transparent',
            name: 'debug-mode',
            value: controllableStateStore.keyedObservables.debug,
            text: _('control.debug.label'),
            update(newValue: boolean) {
              controllableStateStore.update({ debug: newValue })
            },
          }),
        ),
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(button, {
            buttonStyle: 'danger',
            text: _('control.reset.label'),
            click(event: PointerEvent) {
              handleResetButton(getEventParams(controllableStateStore, worker, env, event))
              closeDrawer()
            },
          }),
        ),
      ),
    },
    c.factory(breakoutControllerButtons, { worker, controllableStateStore }),
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
          startingBrickCount: DEFAULT_INTERNAL_GAME_STATE.bricks.length,
          brickMaxPower: BRICK_MAX_POWER,
          githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/breakout`,
          githubRenderingSystemUrl: `${GITHUB_PROJECT_CODE_URL}/common/rendering`,
        },
      }),
    }),
  )
}
