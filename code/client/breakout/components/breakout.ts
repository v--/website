import { breakoutBricks } from './breakout-bricks.ts'
import { breakoutFps } from './breakout-fps.ts'
import { breakoutScore } from './breakout-score.ts'
import { breakoutSplash } from './breakout-splash.ts'
import { breakoutTrace } from './breakout-trace.ts'
import { EMPTY, Observable, bufferLatest, combineLatest, first, map, switchMap, takeUntil, timeInterval } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { waitForNextTask } from '../../../common/support/async.ts'
import { classlist } from '../../../common/support/dom-properties.ts'
import { StateStore } from '../../../common/support/state-store.ts'
import { animationFrameObservable, fromEvent, getCanvas$, getCanvasContext } from '../../core/dom.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { getComputedState, processCollisions, refreshTarget } from '../computed.ts'
import { BALL_RADIUS, EVOLUTION_FREQUENCY, FPS_INDICATOR_REFRESHES_PER_SECOND, PADDLE_HEIGHT, PADDLE_WIDTH } from '../constants.ts'
import { getEventParams, handleKeyDown, handleKeyUp, handleStageBlur, handleStageClick } from '../events.ts'
import { evolveBall, evolveBricks, evolvePaddle } from '../evolution.ts'
import { STAGE } from '../geom/constants.ts'
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

  const canvasContext$ = getCanvas$('breakout-canvas').pipe(
    map(canvas => getCanvasContext(canvas, '2d')),
    takeUntil(env.pageUnload$),
  )

  // For performance reasons, the frequently-changing ball and paddle are drawn on a canvas (unless in debug mode).
  combineLatest({
    state: store.combinedState$,
    ctx: canvasContext$,
    // We also redraw one browser task after the color scheme changes
    colorScheme: env.colorScheme$.pipe(switchMap(_ => waitForNextTask())),
  }).pipe(
    takeUntil(env.pageUnload$),
  ).subscribe(function ({ state, ctx }) {
    const bbox = ctx.canvas.getBoundingClientRect()
    // The canvas starts at a 300x150 default. This resizing incidentally clears the canvas.
    ctx.canvas.width = 2 * bbox.width
    ctx.canvas.height = 2 * bbox.height

    if (state.debug) {
      return
    }

    const computed = getComputedState(state)
    const ratio = ctx.canvas.width / STAGE.width
    const cssStyle = window.getComputedStyle(ctx.canvas)

    ctx.lineWidth = 0
    ctx.fillStyle = cssStyle.getPropertyValue('--breakout-color-ball')
    ctx.beginPath()
    ctx.ellipse(
      (computed.ballCenter.x - STAGE.getLeftPos()) * ratio,
      (computed.ballCenter.y - STAGE.getTopPos()) * ratio,
      BALL_RADIUS * ratio,
      BALL_RADIUS * ratio,
      0,
      0,
      2 * Math.PI,
    )
    ctx.fill()

    ctx.fillStyle = cssStyle.getPropertyValue('--breakout-color-paddle')
    ctx.beginPath()
    ctx.ellipse(
      (state.paddle.center - STAGE.getLeftPos()) * ratio,
      STAGE.getBottomPos() * ratio,
      PADDLE_WIDTH * ratio,
      PADDLE_HEIGHT * ratio,
      0,
      Math.PI,
      2 * Math.PI,
    )
    ctx.fill()
  })

  store.keyedObservables.phase.pipe(
    switchMap(function (phase) {
      if (phase === 'running') {
        return animationFrameObservable()
      }

      return EMPTY
    }),
  ).subscribe(function (frameDuration) {
    const state = store.getCombinedState()
    const newState: Partial<IGameState> = { frameDuration }
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

  const breakoutTraceState$ = store.keyedObservables.debug.pipe(
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
        return store.keyedObservables.frameDuration
      }

      return Observable.of(store.getState('frameDuration'))
    }),
    map(frameDuration => Math.ceil(1000 / frameDuration)),
    bufferLatest(timeInterval(1000 / FPS_INDICATOR_REFRESHES_PER_SECOND)),
    takeUntil(env.pageUnload$),
  )

  return c.html('div', { class: 'breakout-wrapper' },
    c.html('canvas',
      {
        id: 'breakout-canvas',
        class: 'breakout-canvas',
      },
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
        blur(event: FocusEvent) {
          if (event.relatedTarget instanceof HTMLButtonElement && event.relatedTarget.classList.contains('breakout-controller-button')) {
            return
          }

          handleStageBlur(getEventParams(store, env, event))
        },
      },

      c.factory(breakoutTrace, breakoutTraceState$),
      c.factory(breakoutBricks, { bricks: store.keyedObservables.bricks }),
      c.factory(breakoutSplash, { phase: store.keyedObservables.phase }),
      c.factory(breakoutScore, { score: store.keyedObservables.score }),
      c.factory(breakoutFps, { fps: shownFps$, show: store.keyedObservables.debug }),
    ),
  )
}
