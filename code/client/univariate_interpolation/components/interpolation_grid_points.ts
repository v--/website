import { type IPlainVec2D } from '../../../common/math/geom2d.ts'
import { s } from '../../../common/rendering/component.ts'
import { map } from '../../../common/support/iteration.ts'
import { type Action } from '../../../common/types/typecons.ts'
import { STAGE } from '../constants.ts'

interface IInterpolationGridPointsState {
  toggleNode: Action<IPlainVec2D>
}

const GRID_POINT_RADIUS = 0.1

export function interpolationGridPoints({ toggleNode }: IInterpolationGridPointsState) {
  return s('g', { class: 'interpolation-grid-points' },
    ...map(
      point => s('g',
        {
          class: 'interpolation-grid-point',
          transform: `translate(${point.x}, ${point.y})`,
        },
        s('circle', {
          r: GRID_POINT_RADIUS,
          class: 'interpolation-grid-point-circle',
        }),
        s('rect', {
          class: 'interpolation-grid-point-rect',
          x: -0.5, y: -0.5, width: 1, height: 1,
          click(_event: PointerEvent) {
            toggleNode(point)
          },
        }),
        s('title', {
          class: 'interpolation-grid-point-tooltip',
          text: `(${point.x}, ${point.y})`,
        }),
      ),
      iterPoints(),
    ),
  )
}

function* iterPoints() {
  for (let x = Math.ceil(STAGE.getLeftPos()); x < STAGE.getRightPos(); x++) {
    for (let y = Math.ceil(STAGE.getTopPos()); y < STAGE.getBottomPos(); y++) {
      yield { x, y }
    }
  }
}
