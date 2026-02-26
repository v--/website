import { breakoutBall } from './breakout_ball.ts'
import { breakoutBricks } from './breakout_bricks.ts'
import { breakoutFps } from './breakout_fps.ts'
import { breakoutPaddle } from './breakout_paddle.ts'
import { breakoutRays } from './breakout_rays.ts'
import { breakoutScore } from './breakout_score.ts'
import { breakoutSplash } from './breakout_splash.ts'
import { icon } from '../../../common/components/icon.ts'
import { EMPTY, Observable, bufferLatest, combineLatest, first, map, switchMap, takeUntil, timeInterval } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { StateStore } from '../../../common/support/state_store.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { animationFrameObservable, fromEvent } from '../../core/dom.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { getComputedState, processCollisions, refreshTarget } from '../computed.ts'
import { EVOLUTION_FREQUENCY, FPS_INDICATOR_REFRESHES_PER_SECOND, STAGE } from '../constants.ts'
import {
  getEventParams,
  handleKeyDown,
  handleKeyUp,
  handleLeftButtonDown,
  handleLeftButtonUp,
  handleRightButtonDown,
  handleRightButtonUp,
  handleStageClick,
} from '../events.ts'
import { evolveBall, evolveBricks, evolvePaddle } from '../evolution.ts'
import { computeBreakoutTrajectory } from '../geom/trajectory.ts'
import { type IGameState } from '../types.ts'

const SVG_VIEW_BOX = [STAGE.getLeftPos(), STAGE.getTopPos(), STAGE.width, STAGE.height].join(' ')

interface IBreakoutState {
  store: StateStore<IGameState>
}

export function breakout({ store }: IBreakoutState, env: ClientWebsiteEnvironment) {
  fromEvent(window, 'keydown').pipe(
    takeUntil(env.pageUnload$),
  ).subscribe({
    next: function (event) {
      handleKeyDown(getEventParams(store, env, event))
    },
  })

  fromEvent(window, 'keyup').pipe(
    takeUntil(env.pageUnload$),
  ).subscribe({
    next: function (event) {
      handleKeyUp(getEventParams(store, env, event))
    },
  })

  store.keyedObservables.phase.pipe(
    takeUntil(env.pageUnload$),
    switchMap(function (phase) {
      if (phase === 'running') {
        return animationFrameObservable()
      }

      return EMPTY as Observable<uint32>
    }),
  ).subscribe(function (fps) {
    const state = store.getCombinedState()
    const newState: Partial<IGameState> = { fps }
    Object.assign(newState, evolvePaddle({ ...state, ...newState }))
    Object.assign(newState, evolveBall({ ...state, ...newState }))
    Object.assign(newState, processCollisions({ ...state, ...newState }))
    store.update(newState)
  })

  store.keyedObservables.phase.pipe(
    switchMap(function (phase) {
      if (phase === 'running') {
        return timeInterval(1000 * EVOLUTION_FREQUENCY)
      }

      return EMPTY
    }),
  ).subscribe(function () {
    const state = store.getCombinedState()
    const newState: Partial<IGameState> = {}
    Object.assign(newState, evolveBricks({ ...state, ...newState }))
    Object.assign(newState, refreshTarget({ ...state, ...newState }))
    store.update(newState)
  })

  const ballCenter$ = store.combinedState$.pipe(
    map(state => getComputedState(state).ballCenter),
  )

  const trajectory$ = combineLatest({
    paddle: store.keyedObservables.paddle,
    bricks: store.keyedObservables.bricks,
    ballTarget: store.keyedObservables.ballTarget,
  }).pipe(
    map(function ({ paddle, ballTarget, bricks }) {
      const ballSource = store.getState('ballSource')
      return computeBreakoutTrajectory(ballSource, ballTarget, paddle, bricks)
    }),
  )

  const breakoutRayState$ = store.keyedObservables.debug.pipe(
    switchMap(function (debug) {
      const result = combineLatest({
        debug,
        trajectory: trajectory$,
        ballCenter: ballCenter$,
        paddle: store.keyedObservables.paddle,
        bricks: store.keyedObservables.bricks,
      })

      if (debug) {
        return result
      }

      return first(result)
    }),
  )

  const shownFps$ = combineLatest({
    phase: store.keyedObservables.phase,
    debug: store.keyedObservables.debug,
  }).pipe(
    switchMap(function ({ phase, debug }) {
      if (phase === 'running' && debug) {
        return store.keyedObservables.fps
      }

      return Observable.of(store.getState('fps'))
    }),
    bufferLatest(timeInterval(1000 / FPS_INDICATOR_REFRESHES_PER_SECOND)),
  )

  return c.html('div', { class: 'breakout-controller' },
    c.html('button',
      {
        class: 'breakout-controller-button',
        pointerdown(event: MouseEvent) {
          handleLeftButtonDown(getEventParams(store, env, event))
        },

        pointerup(event: MouseEvent) {
          handleLeftButtonUp(getEventParams(store, env, event))
        },
      },
      c.factory(icon, {
        class: 'breakout-controller-button-icon',
        refId: 'core',
        name: 'solid/chevron-left',
      }),
    ),

    c.svg('svg',
      {
        class: store.keyedObservables.phase.pipe(
          map(phase => classlist('breakout', phase === 'running' && 'breakout-active')),
        ),
        viewBox: SVG_VIEW_BOX,
        click(event: MouseEvent) {
          handleStageClick(getEventParams(store, env, event))
        },
      },

      c.factory(breakoutRays, breakoutRayState$),
      c.factory(breakoutBricks, { bricks: store.keyedObservables.bricks }),
      c.factory(breakoutPaddle, { paddle: store.keyedObservables.paddle }),
      c.factory(breakoutBall, { ballCenter: ballCenter$ }),
      c.factory(breakoutSplash, { phase: store.keyedObservables.phase }),
      c.factory(breakoutScore, { score: store.keyedObservables.score }),
      c.factory(breakoutFps, { fps: shownFps$, show: store.keyedObservables.debug }),
    ),

    c.html('button',
      {
        class: 'breakout-controller-button',
        pointerdown(event: MouseEvent) {
          handleRightButtonDown(getEventParams(store, env, event))
        },

        pointerup(event: MouseEvent) {
          handleRightButtonUp(getEventParams(store, env, event))
        },
      },
      c.factory(icon, {
        class: 'breakout-controller-button-icon',
        refId: 'core',
        name: 'solid/chevron-right',
      }),
    ),
  )
}
