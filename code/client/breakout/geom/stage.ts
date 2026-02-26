import { computeBallIntersectionWithFigure } from './intersection.ts'
import { AARect, type IAARectConfig, type IPlainVec2D, Vec2D } from '../../../common/math/geom2d.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from '../types.ts'

export interface IBreakoutStageConfig extends IAARectConfig {
  offset: float64
}

export class BreakoutStage extends AARect implements IBreakoutIntersectible, IAARectConfig {
  readonly offset: float64
  readonly bounds: AARect

  constructor(config: IBreakoutStageConfig) {
    super(config)
    this.offset = config.offset
    this.bounds = new AARect({
      x: config.x + config.offset,
      y: config.y + config.offset,
      width: config.width - 2 * config.offset,
      height: config.height - config.offset,
    })
  }

  intersectWithBall(ballSource: Vec2D, ballDirection: IPlainVec2D): IBreakoutIntersection | undefined {
    return computeBallIntersectionWithFigure(ballSource, ballDirection, this, this.bounds)
  }
}
