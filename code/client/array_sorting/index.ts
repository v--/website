import { ALGORITHMS } from './algorithms.ts'
import { MAX_ACTIONS_PER_SECOND, MIN_ACTIONS_PER_SECOND } from './constants.ts'
import { SortingFrameStore } from './store.ts'
import { rich } from '../../common/components/rich.ts'
import { slider } from '../../common/components/slider.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { switchMap } from '../../common/observable.ts'
import { c } from '../../common/rendering/component.ts'
import { type uint32 } from '../../common/types/numbers.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { playgroundMenu } from '../core/components/playground_menu.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { sortingCard } from './components/sorting_card.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext$
  const store = new SortingFrameStore(env.pageUnload$)

  return c('main', { class: 'sorting-page' },
    c(rich, {
      rootTag: 'article',
      doc: _(
        {
          bundleId: 'array_sorting', key: 'text',
          context: {
            githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/sorting`,
          },
        },
        { rich: true },
      ),
    }),
    c(playgroundMenu, { class: 'sorting-page-menu' },
      c(slider, {
        name: 'sorting_speed',
        content: _({ bundleId: 'array_sorting', key: 'control.speed.label' }),
        inputClass: 'sorting-page-menu-control-speed',
        min: MIN_ACTIONS_PER_SECOND,
        max: MAX_ACTIONS_PER_SECOND,
        value: store.speed$,
        update(newValue: uint32) {
          store.updateSpeed(newValue)
        },
      }),
      c('button', {
        class: 'sorting-phase-button',
        text: store.globalSortingPhase$.pipe(
          switchMap(phase => _({ bundleId: 'array_sorting', key: `control.run.label.${phase}` })),
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
        },
      }),
      c('button', {
        class: 'sorting-phase-button',
        text: _({ bundleId: 'array_sorting', key: 'control.reset.label' }),
        click() {
          store.resetGlobalSortingState()
        },
      }),
    ),
    c('div', { class: 'sorting-cards' },
      ...ALGORITHMS.map(algorithm => c(sortingCard, { algorithm, store })),
    ),
  )
}
