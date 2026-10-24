import { heartRateSimulation } from './components/heart-rate-simulation.ts'
import { type CycleAtPeakMessage, type WorkerToHostMessage } from './messages.ts'
import { DEFAULT_CONTROLLABLE_HRS_STATE, DEFAULT_INTERNAL_HRS_STATE } from './state.ts'
import { type IControllableHrsState, type IInternalHrsState } from './types.ts'
import { button } from '../../common/components/button.ts'
import { rich } from '../../common/components/rich.ts'
import { filter, scan, startWith, switchMap, takeUntil } from '../../common/observable.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state-store.ts'
import { type float64 } from '../../common/types/numbers.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { playgroundMenu } from '../core/components/playground-menu.ts'
import { fromEvent } from '../core/dom.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { heartRateData } from './components/heart-rate-data.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('heart-rate')

  const internalStateStore = new StateStore<IInternalHrsState>(DEFAULT_INTERNAL_HRS_STATE, env.pageUnload$)
  const controllableStateStore = new StateStore<IControllableHrsState>(DEFAULT_CONTROLLABLE_HRS_STATE, env.pageUnload$)

  const worker = new Worker(new URL('worker.js', import.meta.url), { type: 'module' })
  const subscription = env.pageUnload$.subscribe(() => {
    worker.terminate()
    subscription.unsubscribe()
  })

  controllableStateStore.stateUpdate$.subscribe(function (state) {
    worker.postMessage({ kind: 'stateUpdate', update: state })
  })

  const peakTimestamps$ = fromEvent(worker, 'message').pipe(
    takeUntil(env.pageUnload$),
    filter((event: MessageEvent<WorkerToHostMessage>) => event.data.kind == 'newRPoint'),
    scan(
      function (accum: float64[], event: MessageEvent<CycleAtPeakMessage>) {
        const message = event.data
        const windowSize = 1000 * controllableStateStore.getState('windowSize')
        const filtered = accum.filter(timestamp => message.timestamp - timestamp < windowSize)
        return [...filtered, message.timestamp]
      },
      [],
    ),
    startWith([]),
  )

  fromEvent(worker, 'message').pipe(
    takeUntil(env.pageUnload$),
  ).subscribe({
    next: function (event: MessageEvent<WorkerToHostMessage>) {
      const message = event.data

      switch (message.kind) {
        case 'stateUpdate':
          internalStateStore.update(message.update)
          break
      }
    },
  })

  return c.html('main', { class: 'heart-rate-page' },
    c.html('h1', { text: _('heading.main') }),
    c.factory(heartRateSimulation, {
      offset: internalStateStore.keyedObservables.offset,
      pulse: internalStateStore.keyedObservables.pulse,
      showLabels: controllableStateStore.keyedObservables.showLabels,
    }),
    c.html('hr', { class: 'heart-rate-page-divider' }),
    c.factory(playgroundMenu, {
      stickTop: true,
      disableSubmenuCollapse: true,
      submenu: () => c.html('menu', { class: 'playground-submenu' },
        c.html('li', { class: 'menu-group-item playground-submenu-item' },
          c.factory(button, {
            class: 'heart-rate-start-button',
            text: controllableStateStore.keyedObservables.running.pipe(
              switchMap(running => _(`control.start.label.${running ? 'running' : 'paused'}`)),
            ),
            click() {
              const isRunning = controllableStateStore.getState('running')
              controllableStateStore.update({
                running: !isRunning,
                showLabels: isRunning,
              })
            },
          }),
        ),
      ),
    }),
    c.html('p', {
      text: _({ key: 'overview' }),
    }),
    c.factory(heartRateData, { controllableStateStore, peakTimestamps: peakTimestamps$ }),
    c.factory(rich, {
      doc: _.rich$({
        key: 'description',
        context: {
          githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/heart-rate`,
          bluetoothSpecUrl: 'https://www.bluetooth.com/specifications/specs/html/?src=HRS_v1.0/out/en/index-en.html',
          kubiosBlogUrl: 'https://www.kubios.com/blog/hrv-analysis-methods/',
          overviewPaperUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5624990/',
          overviewPaperDoi: '10.3389/fpubh.2017.00258',
        },
      }),
    }),
  )
}
