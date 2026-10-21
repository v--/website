import { evolveSimulation } from './evolution.js'
import { type HostToWorkerMessage } from './messages.js'
import { DEFAULT_CONTROLLABLE_HRS_STATE, DEFAULT_INTERNAL_HRS_STATE } from './state.js'
import { type IControllableHrsState, type IInternalHrsState } from './types.js'
import { EMPTY, switchMap } from '../../common/observable.js'
import { StateStore } from '../../common/support/state-store.js'
import { animationFrameObservable, fromEvent } from '../core/dom.js'

const internalStateStore = new StateStore<IInternalHrsState>(DEFAULT_INTERNAL_HRS_STATE, EMPTY)
const controllableStateStore = new StateStore<IControllableHrsState>(DEFAULT_CONTROLLABLE_HRS_STATE, EMPTY)

internalStateStore.stateUpdate$.subscribe(function (state) {
  self.postMessage({ kind: 'stateUpdate', update: state })
})

fromEvent(self, 'message').subscribe({
  next: function (event: MessageEvent<HostToWorkerMessage>) {
    const message = event.data

    switch (message.kind) {
      case 'stateUpdate':
        controllableStateStore.update(message.update)
        break
    }
  },
})

controllableStateStore.keyedObservables.running.pipe(
  switchMap(function (running) {
    if (running) {
      return animationFrameObservable()
    }

    return EMPTY
  }),
).subscribe(function () {
  const internalState = internalStateStore.getCombinedState()
  const newState: IInternalHrsState = { ...internalState, ...evolveSimulation(internalState) }
  internalStateStore.update(newState)
})
