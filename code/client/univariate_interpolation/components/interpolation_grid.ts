import { type IPlainVec2D } from '../../../common/math/geom2d.ts'
import { isClose } from '../../../common/support/floating.ts'
import { type StateStore } from '../../../common/support/state_store.ts'
import { STAGE } from '../constants.ts'
import { type IInterpolationState } from '../types.ts'
import { interpolationGridCurves } from './interpolation_grid_curves.ts'
import { interpolationGridKnots } from './interpolation_grid_knots.ts'
import { interpolationGridPoints } from './interpolation_grid_points.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'

const SVG_VIEW_BOX = [STAGE.getLeftPos(), STAGE.getTopPos(), STAGE.width, STAGE.height].join(' ')

interface IInterpolationGridState {
  store: StateStore<IInterpolationState>
}

export function interpolationGrid({ store }: IInterpolationGridState) {
  return c.svg('svg',
    {
      role: 'grid',
      class: 'interpolation-grid',
      viewBox: SVG_VIEW_BOX,
    },

    c.svg('polyline', {
      class: 'interpolation-grid-axis interpolation-grid-axis-x',
      points: `${STAGE.getLeftPos()},0 ${STAGE.getRightPos()},0`,
    }),

    c.svg('polyline', {
      class: 'interpolation-grid-axis interpolation-grid-axis-y',
      points: `0,${STAGE.getTopPos()} 0,${STAGE.getBottomPos()}`,
    }),

    c.factory(interpolationGridPoints, {
      toggleNode(point: IPlainVec2D) {
        const knots = store.getState('knots')
        const y = knots.getValue(point.x)

        if (y !== undefined && isClose(y, point.y)) {
          store.update({
            knots: knots.delete(point.x),
          })
        } else {
          store.update({
            knots: knots.set(point.x, point.y),
          })
        }
      },
    }),

    c.factory(interpolationGridCurves, {
      interpolated: store.keyedObservables.interpolated,
      visible: store.keyedObservables.visible,
    }),

    c.factory(interpolationGridKnots, {
      knots: store.keyedObservables.knots,
    }),
  )
}
