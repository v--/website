import { fleeingButtonAttractors } from './fleeing_button_attractors.ts'
import { fleeingButtonMouseArea } from './fleeing_button_mouse_area.ts'
import { Vec2D } from '../../../common/math/geom2d.ts'
import { withLatestFrom } from '../../../common/observable/operators/with_latest_from.ts'
import { Observable, combineLatest, map, switchMap } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { clamp } from '../../../common/support/floating.ts'
import { type StateStore } from '../../../common/support/state_store.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { adjustActiveAttractor } from '../attractors.ts'
import {
  ATTRACTOR_SAFETY_DISTANCE,
  BUTTON_SIZE,
  DEFAULT_MOVEMENT_DISTANCE,
  MAXIMUM_BUTTON_SPEEDUP,
  MOUSE_DISTANCE_THRESHOLD,
  STAGE,
} from '../constants.ts'
import { type IFleeingButtonState } from '../types.ts'

interface IFleeingButtonStageState {
  store: StateStore<IFleeingButtonState>
}

const SVG_VIEW_BOX = [STAGE.getLeftPos(), STAGE.getTopPos(), STAGE.width, STAGE.height].join(' ')

export function fleeingButtonStage({ store }: IFleeingButtonStageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('fleeing_button')

  store.keyedObservables.mousePosition.pipe(
    withLatestFrom(store.combinedState$),
  ).subscribe({
    next([mousePosition, { mousePosition: oldMousePosition, buttonPosition, activeAttractor }]) {
      if (mousePosition === undefined || mousePosition.distanceTo(buttonPosition) > MOUSE_DISTANCE_THRESHOLD) {
        return
      }

      const newAttractor = adjustActiveAttractor(buttonPosition, mousePosition, activeAttractor)
      const distance = oldMousePosition === undefined ? DEFAULT_MOVEMENT_DISTANCE : mousePosition.distanceTo(oldMousePosition)
      const speedAdjustment = clamp(Math.floor(1 / mousePosition.distanceTo(buttonPosition)), 1, MAXIMUM_BUTTON_SPEEDUP)

      if (newAttractor !== activeAttractor) {
        store.update({ activeAttractor: newAttractor })
      }

      if (newAttractor !== undefined) {
        const attractorDirection = newAttractor.sub(buttonPosition)

        if (attractorDirection.getNorm() > ATTRACTOR_SAFETY_DISTANCE) {
          const target = buttonPosition.translate(attractorDirection.scaleToNormed(), speedAdjustment * distance)
          store.update({ buttonPosition: target })
        }
      }
    },
  })

  const attractorState$ = store.keyedObservables.debug.pipe(
    switchMap(function (debug) {
      if (debug) {
        return combineLatest({
          activeAttractor: store.keyedObservables.activeAttractor,
          debug,
        })
      }

      return Observable.of({ debug: false })
    }),
  )

  const mouseAreaState$: Observable<IFleeingButtonState> = store.keyedObservables.debug.pipe(
    switchMap(debug => debug ? store.combinedState$ : Observable.of(store.getCombinedState())),
  )

  const iconSpec = env.iconStore.getIconSpec('fleeing_button', 'solid/person-running')

  return c.svg('svg',
    {
      class: 'fleeing-button-stage',
      viewBox: SVG_VIEW_BOX,
      async pointermove(event: PointerEvent) {
        if (event.pointerType !== 'mouse') {
          return
        }

        const stage = event.currentTarget as HTMLDivElement
        const bbox = stage.getBoundingClientRect()
        const x = STAGE.getLeftPos() + STAGE.width * (event.pageX - bbox.left) / bbox.width
        const y = STAGE.getTopPos() + STAGE.height * (event.pageY - bbox.top) / bbox.height

        store.update({
          mousePosition: new Vec2D({ x, y }),
        })
      },

      async mouseleave(_event: MouseEvent) {
        store.update({
          mousePosition: undefined,
        })
      },
    },
    c.factory(fleeingButtonMouseArea, mouseAreaState$),
    c.factory(fleeingButtonAttractors, attractorState$),
    // The "button" itself ideally belongs in its own component, but we keep it here for more efficient redrawing
    // We keep it as an SVG to allow rescaling
    c.svg('g',
      {
        transform: store.keyedObservables.buttonPosition.pipe(
          map(({ x, y }) => {
            return `translate(${x}, ${y})`
          }),
        ),
      },
      c.svg('rect',
        {
          class: 'fleeing-button',
          x: -BUTTON_SIZE.x / 2,
          y: -BUTTON_SIZE.y / 2,
          width: BUTTON_SIZE.x,
          height: BUTTON_SIZE.y,
          click(event: PointerEvent) {
            switch (event.pointerType) {
              case 'touch': {
                const message = _.plain('message.click.touch')
                window.alert(message)
                break
              }

              case 'pen': {
                const message = _.plain('message.click.pen')
                window.alert(message)
                break
              }

              case 'mouse': {
                const message = _.plain('message.click.mouse')
                window.alert(message)
                break
              }
            }
          },
        },
      ),
      // We could use the icon component here instead, but WebKit refuses to apply scaling transforms to nested SVG elements
      c.svg('defs', undefined,
        c.svg('symbol', { id: 'icon', viewBox: iconSpec.viewBox },
          c.svg('path', { d: iconSpec.path }),
        ),
      ),
      c.svg('use', { class: 'fleeing-button-icon', href: '#icon' }),
    ),
  )
}
