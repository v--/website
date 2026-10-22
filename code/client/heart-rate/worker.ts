import { evolveSimulation, fillPulseSimulation, getLastWithVisibleR } from './evolution.js'
import { type HostToWorkerMessage } from './messages.js'
import { DEFAULT_CONTROLLABLE_HRS_STATE, DEFAULT_INTERNAL_HRS_STATE } from './state.js'
import { type IControllableHrsState, type IInternalHrsState, type IPulseCycle } from './types.js'
import { EMPTY, switchMap } from '../../common/observable.js'
import { StateStore } from '../../common/support/state-store.js'
import { type float64 } from '../../common/types/numbers.js'
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

let savedLastVisible: IPulseCycle | undefined = undefined
let elapsed = 0.0

controllableStateStore.keyedObservables.running.pipe(
  switchMap(function (running) {
    if (running) {
      return animationFrameObservable()
    }

    return EMPTY
  }),
).subscribe(function (frameDuration: float64) {
  elapsed += frameDuration

  const internalState = internalStateStore.getCombinedState()
  const targetRate = controllableStateStore.getState('targetRate')
  const newState: IInternalHrsState = {
    ...internalState,
    ...evolveSimulation({ ...internalState, frameDuration }, targetRate),
    frameDuration,
  }

  const lastVisible = getLastWithVisibleR(newState.pulse, newState.offset)

  if (lastVisible !== savedLastVisible) {
    self.postMessage({ kind: 'newRPoint', cycle: lastVisible, timestamp: elapsed })
    savedLastVisible = lastVisible
  }

  internalStateStore.update(newState)
})

// We initialize the pulse after initializing the worker so that the main process gets the same initial pulse
{
  const initialPulse: IPulseCycle[] = []
  fillPulseSimulation(initialPulse)
  internalStateStore.setState('pulse', initialPulse)

  let lastRemainder = 0.0
  const frameDuration = internalStateStore.getState('frameDuration')
  const evoluationDelta = frameDuration / 1000
  const lastVisible = getLastWithVisibleR(
    initialPulse,
    internalStateStore.getState('offset'),
  )

  for (const cycle of initialPulse) {
    const quotient = cycle.duration / evoluationDelta - lastRemainder
    lastRemainder = Math.ceil(quotient) - quotient
    elapsed += frameDuration * quotient
    self.postMessage({ kind: 'newRPoint', cycle, timestamp: elapsed })

    if (cycle === lastVisible) {
      savedLastVisible = lastVisible
      break
    }
  }
}
