import { processCollisions, refreshTarget } from './computed.js'
import { EVOLUTION_FREQUENCY } from './constants.js'
import { evolveBall, evolveBricks, evolvePaddle } from './evolution.js'
import { computeBreakoutTrajectory } from './geom/trajectory.js'
import { type HostToWorkerMessage } from './messages.js'
import { DEFAULT_CONTROLLABLE_GAME_STATE, DEFAULT_INTERNAL_GAME_STATE } from './state.js'
import { type IControllableGameState, type IInternalGameState } from './types.js'
import { EMPTY, combineLatest, map, switchMap, timeInterval } from '../../common/observable.js'
import { isClose } from '../../common/support/floating.js'
import { StateStore } from '../../common/support/state-store.js'
import { animationFrameObservable, fromEvent } from '../core/dom.js'

const internalStateStore = new StateStore<IInternalGameState>(DEFAULT_INTERNAL_GAME_STATE, EMPTY)
const controllableStateStore = new StateStore<IControllableGameState>(DEFAULT_CONTROLLABLE_GAME_STATE, EMPTY)

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

      case 'reset':
        internalStateStore.update(DEFAULT_INTERNAL_GAME_STATE)
        break
    }
  },
})

controllableStateStore.keyedObservables.phase.pipe(
  switchMap(function (phase) {
    if (phase === 'running') {
      return animationFrameObservable()
    }

    return EMPTY
  }),
).subscribe(function (frameDuration) {
  const internalState = internalStateStore.getCombinedState()
  const paddleDirection = controllableStateStore.getState('paddleDirection')
  const newState: Partial<IInternalGameState> = { frameDuration }

  Object.assign(newState, evolvePaddle({ ...internalState, ...newState }, paddleDirection))
  Object.assign(newState, evolveBall({ ...internalState, ...newState }))

  if (isClose(newState.ballPosition!, 1.0) && (newState.ballTarget || internalState.ballTarget).isStageBottom) {
    self.postMessage({ kind: 'gameOver' })
  } else {
    Object.assign(newState, processCollisions({ ...internalState, ...newState }))

    if (newState.bricks && newState.bricks.length === 0) {
      self.postMessage({ kind: 'gameCompleted' })
    }
  }

  internalStateStore.update(newState)
})

controllableStateStore.keyedObservables.phase.pipe(
  switchMap(function (phase) {
    if (phase === 'running') {
      return timeInterval(1000 * EVOLUTION_FREQUENCY)
    }

    return EMPTY
  }),
).subscribe(function () {
  const state = internalStateStore.getCombinedState()
  const newState: Partial<IInternalGameState> = {}
  Object.assign(newState, evolveBricks({ ...state, ...newState }))
  Object.assign(newState, refreshTarget({ ...state, ...newState }))
  internalStateStore.update(newState)
})

const trajectory$ = combineLatest({
  paddleCenter: internalStateStore.keyedObservables.paddleCenter,
  ballTarget: internalStateStore.keyedObservables.ballTarget,
  bricks: internalStateStore.keyedObservables.bricks,
}).pipe(
  map(function ({ paddleCenter, ballTarget, bricks }) {
    const ballSource = internalStateStore.getState('ballSource')
    return computeBreakoutTrajectory(ballSource, ballTarget, paddleCenter, bricks)
  }),
)

controllableStateStore.keyedObservables.debug.pipe(
  switchMap(function (debug) {
    if (debug) {
      return trajectory$
    }

    return EMPTY
  }),
).subscribe(function (trajectory) {
  internalStateStore.update({ trajectory })
})
