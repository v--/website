import { ALGORITHMS } from './algorithms.ts'
import { MAX_ACTIONS_PER_SECOND, MIN_ACTIONS_PER_SECOND } from './constants.ts'
import { SortingFrameStore } from './store.ts'
import { rich } from '../../common/components/rich.ts'
import { slider } from '../../common/components/slider.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { switchMap } from '../../common/observable.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { type uint32 } from '../../common/types/numbers.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { playgroundMenu } from '../core/components/playground_menu.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { sortingCard } from './components/sorting_card.ts'
import { button } from '../../common/components/button.ts'
import { toggleModalDialog } from '../core/dom.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('array_sorting')
  const store = new SortingFrameStore(env.pageUnload$)

  return c.html('main', { class: 'sorting-page' },
    c.factory(rich, {
      rootTag: 'section',
      doc: _.rich$(
        {
          key: 'text',
          context: {
            generatorDocUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator',
            githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/array_sorting`,
          },
        },
      ),
    }),
    c.factory(playgroundMenu, {
      stickBottom: true,
      submenu: () => c.html('menu', { class: 'playground-submenu' },
        c.html('li', { class: 'menu-group-item playground-submenu-item' },
          c.factory(slider<uint32>, {
            name: 'sorting_speed',
            text: _('control.speed.label'),
            inputClass: 'sorting-page-menu-control-speed',
            min: MIN_ACTIONS_PER_SECOND,
            max: MAX_ACTIONS_PER_SECOND,
            value: store.speed$,
            update(newValue: uint32) {
              store.updateSpeed(newValue)
            },
          }),
        ),
        c.html('li', { class: 'menu-group-item playground-submenu-item' },
          c.factory(button, {
            buttonStyle: 'transparent',
            class: 'sorting-phase-button',
            text: store.globalSortingPhase$.pipe(
              switchMap(phase => _(`control.run.label.${phase}`)),
            ),
            click() {
              const phase = store.getGlobalSortingPhase()

              switch (phase) {
                case 'running':
                  store.updateGlobalPhase('paused')
                  break

                case 'completed':
                  store.resetGlobalSortingState()
                  // eslint-disable-next-line no-fallthrough
                default:
                  store.updateGlobalPhase('running')
              }

              toggleModalDialog('playground-menu-drawer-dialog', false)
            },
          }),
        ),
        c.html('li', { class: 'menu-group-item playground-submenu-item' },
          c.factory(button, {
            buttonStyle: 'transparent',
            class: 'sorting-phase-button',
            text: _('control.reset.label'),
            click() {
              store.resetGlobalSortingState()
              toggleModalDialog('playground-menu-drawer-dialog', false)
            },
          }),
        ),
      ),
    }),
    c.html('div', { class: 'sorting-page-contents' },
      c.html('hr', { class: 'sorting-page-top-divider' }),
      c.html('div', { class: 'sorting-cards' },
        ...ALGORITHMS.map(algorithm => c.factory(sortingCard, { algorithm, store })),
      ),
    ),
  )
}
