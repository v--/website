import { breakoutBall } from './breakout-ball.ts'
import { breakoutBricks } from './breakout-bricks.ts'
import { breakoutFps } from './breakout-fps.ts'
import { breakoutPaddle } from './breakout-paddle.ts'
import { breakoutScore } from './breakout-score.ts'
import { breakoutSplash } from './breakout-splash.ts'
import { breakoutTrace } from './breakout-trace.ts'
import { Observable, bufferLatest, combineLatest, map, switchMap, takeUntil, timeInterval } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom-properties.ts'
import { StateStore } from '../../../common/support/state-store.ts'
import { fromEvent } from '../../core/dom.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { getComputedState } from '../computed.ts'
import { FPS_INDICATOR_REFRESHES_PER_SECOND } from '../constants.ts'
import { getEventParams, handleKeyDown, handleKeyUp, handleStageBlur, handleStageClick } from '../events.ts'
import { STAGE } from '../geom/stage.ts'
import { type IControllableGameState, type IInternalGameState } from '../types.ts'

const SVG_VIEW_BOX = [STAGE.getLeftPos(), STAGE.getTopPos(), STAGE.width, STAGE.height].join(' ')

interface IBreakoutState {
  worker: Worker
  internalStateStore: StateStore<IInternalGameState>
  controllableStateStore: StateStore<IControllableGameState>
}

export function breakout({ worker, internalStateStore, controllableStateStore }: IBreakoutState, env: ClientWebsiteEnvironment) {
  fromEvent(window, 'keydown').pipe(
    takeUntil(env.pageUnload$),
  ).subscribe({
    next: function (event) {
      handleKeyDown(getEventParams(controllableStateStore, worker, env, event))
    },
  })

  fromEvent(window, 'keyup').pipe(
    takeUntil(env.pageUnload$),
  ).subscribe({
    next: function (event) {
      handleKeyUp(getEventParams(controllableStateStore, worker, env, event))
    },
  })

  const ballCenter$ = internalStateStore.combinedState$.pipe(
    map(state => getComputedState(state).ballCenter),
  )

  const breakoutTraceState$ = combineLatest({
    debug: controllableStateStore.keyedObservables.debug,
    trajectory: internalStateStore.keyedObservables.trajectory,
    ballCenter: ballCenter$,
    paddleCenter: internalStateStore.keyedObservables.paddleCenter,
    bricks: internalStateStore.keyedObservables.bricks,
  })

  const shownFps$ = combineLatest({
    phase: controllableStateStore.keyedObservables.phase,
    debug: controllableStateStore.keyedObservables.debug,
  }).pipe(
    switchMap(function ({ phase, debug }) {
      if (phase === 'running' && debug) {
        return internalStateStore.keyedObservables.frameDuration
      }

      return Observable.of(internalStateStore.getState('frameDuration'))
    }),
    map(frameDuration => Math.ceil(1000 / frameDuration)),
    bufferLatest(timeInterval(1000 / FPS_INDICATOR_REFRESHES_PER_SECOND)),
  )

  return c.svg('svg',
    {
      class: controllableStateStore.keyedObservables.phase.pipe(
        map(phase => classlist('breakout', phase === 'running' && 'breakout-active')),
      ),
      viewBox: SVG_VIEW_BOX,
      click(event: MouseEvent) {
        handleStageClick(getEventParams(controllableStateStore, worker, env, event))
      },
      blur(event: FocusEvent) {
        if (event.relatedTarget instanceof HTMLButtonElement && event.relatedTarget.classList.contains('breakout-controller-button')) {
          return
        }

        handleStageBlur(getEventParams(controllableStateStore, worker, env, event))
      },
    },

    c.factory(breakoutTrace, breakoutTraceState$),
    c.factory(breakoutBricks, { bricks: internalStateStore.keyedObservables.bricks }),
    c.factory(breakoutPaddle, { paddleCenter: internalStateStore.keyedObservables.paddleCenter }),
    c.factory(breakoutBall, { ballCenter: ballCenter$ }),
    c.factory(breakoutSplash, { phase: controllableStateStore.keyedObservables.phase }),
    c.factory(breakoutScore, { score: internalStateStore.keyedObservables.score }),
    c.factory(breakoutFps, { fps: shownFps$, show: controllableStateStore.keyedObservables.debug }),
  )
}
