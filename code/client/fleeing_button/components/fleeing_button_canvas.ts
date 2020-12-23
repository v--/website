import { c } from '../../../common/rendering/component.js'
import { styles } from '../../../common/support/dom_properties.js'
import { showMessage } from '../../core/support/dom.js'
import { SubjectState } from '../types/state.js'

export function fleeingButtonCanvas({ buttonOrigin }: SubjectState) {
  return c('div', { class: 'fleeing-button-canvas' },
    c('button', {
      class: 'cool-button fleeing-button',
      text: 'Click me',
      style: styles({
        left: buttonOrigin === undefined ? '0' : 100 * buttonOrigin.x + '%',
        top: buttonOrigin === undefined ? '0' : 100 * buttonOrigin.y + '%'
      }),
      mouseup(_event: MouseEvent) {
        showMessage('You have won!')
      },
      touchend(event: TouchEvent) {
        showMessage('Using touchscreens is cheating. Try chasing the button with a mouse.')
        event.preventDefault()
      }
    })
  )
}
