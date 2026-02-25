import { BreakoutBall } from './ball.ts'
import { AARect, type IAARectConfig } from '../../../common/math/geom2d.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { type IBreakoutIntersectible, type IBreakoutIntersection } from '../types.ts'

export interface IBreakoutStageConfig extends IAARectConfig {
  offset: float64
}

export class BreakoutStage extends AARect implements IBreakoutIntersectible, IAARectConfig {
  readonly offset: float64

  constructor(config: IBreakoutStageConfig) {
    super(config)
    this.offset = config.offset
  }

  intersectWithBall(ball: BreakoutBall): IBreakoutIntersection | undefined {
    return ball.computeIntersectionWithFigure(this, this)
  }
}
