import { createComponent as c } from '../../../common/rendering/component.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { STAGE } from '../constants.ts'
import { type GamePhase } from '../types.ts'

interface IBreakoutSplashState {
  phase: GamePhase
}

export function breakoutSplash({ phase }: IBreakoutSplashState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('breakout')

  return c.svg('g', { class: 'breakout-splash' },
    phase !== 'running' && c.svg('rect', {
      class: 'breakout-splash-background',
      x: STAGE.getLeftPos(),
      y: STAGE.getTopPos(),
      width: STAGE.width,
      height: STAGE.height,
    }),
    phase !== 'running' && c.svg('text', {
      class: 'breakout-text breakout-splash-message',
      text: _(`splash.message.${phase}`),
      y: STAGE.getTopPos() + STAGE.height / 2 - 0.25,
    }),
    phase !== 'running' && c.svg('text', {
      class: 'breakout-text breakout-splash-hint',
      text: _(`splash.hint.${phase}`),
      y: STAGE.getTopPos() + STAGE.height / 2 + 1.25,
    }),
  )
}
