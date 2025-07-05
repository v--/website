import { s } from '../../../common/rendering/component.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { STAGE } from '../constants.ts'

interface IBreakoutFpsState {
  fps: uint32
  show: boolean
}

export function breakoutFps({ fps, show }: IBreakoutFpsState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext$

  return s('text', {
    class: 'breakout-text breakout-fps',
    text: !show ?
      '' :
        _({
          bundleId: 'breakout', key: 'fps',
          context: { fps },
        }),

    x: String(STAGE.width / 2 - 0.5),
    y: String(STAGE.getTopPos() + 1),
  })
}
