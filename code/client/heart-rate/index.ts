import { heartRateSimulation } from './components/heart-rate-simulation.ts'
import { DEFAULT_CONTROLLABLE_HRS_STATE, DEFAULT_INTERNAL_HRS_STATE } from './state.ts'
import { type IControllableHrsState, type IInternalHrsState } from './types.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state-store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'

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

  return c.html('main', { class: 'heart-rate-page' },
    c.html('h1', { text: _('heading.main') }),
    c.factory(heartRateSimulation, { internalStateStore, controllableStateStore }),
  )
}
