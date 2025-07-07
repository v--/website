import { createComponent as c } from '../../../common/rendering/component.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { STAGE } from '../constants.ts'

interface IBreakoutScoreState {
  score: uint32
}

export function breakoutScore({ score }: IBreakoutScoreState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('breakout')

  return c.svg('text', {
    class: 'breakout-text breakout-score',
    text: _({ key: 'score', context: { score } }),
    x: String(STAGE.getLeftPos() + 0.5),
    y: String(STAGE.getTopPos() + 1),
  })
}
