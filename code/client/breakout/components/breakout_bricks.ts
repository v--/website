import { createComponent as c } from '../../../common/rendering/component.ts'
import { type BreakoutBrick } from '../geom/brick.ts'

interface IBreakoutBricksState {
  bricks: BreakoutBrick[]
}

const BRICK_VISUAL_PADDING = 0.01
const BRICK_VISUAL_SIZE = 1 - 2 * BRICK_VISUAL_PADDING

export function breakoutBricks({ bricks }: IBreakoutBricksState) {
  return c.svg('g', { class: 'breakout-bricks' },
    ...bricks.map(function (brick) {
      return c.svg('rect', {
        class: `breakout-brick breakout-brick-power-${brick.power}`,
        width: BRICK_VISUAL_SIZE,
        height: BRICK_VISUAL_SIZE,
        x: brick.x + BRICK_VISUAL_PADDING,
        y: brick.y + BRICK_VISUAL_PADDING,
      })
    }),
  )
}
