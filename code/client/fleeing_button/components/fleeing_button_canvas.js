import { c } from '../../../common/rendering/component.js'
import { styles } from '../../../common/support/dom_properties.js'
import { showMessage } from '../../core/support/dom.js'

/**
 * @param {import('../flee.js').SubjectState} state
 */
export function fleeingButtonCanvas({ buttonOrigin }) {
  return c('div', { class: 'fleeing-button-canvas' },
    c('button', {
      class: 'cool-button fleeing-button',
      text: 'Click me',
      style: styles({
        left: buttonOrigin === undefined ? '0' : 100 * buttonOrigin.x + '%',
        top: buttonOrigin === undefined ? '0' : 100 * buttonOrigin.y + '%'
      }),
      /**
       * @param {MouseEvent} _event
       */
      mouseup(_event) {
        showMessage('You have won!')
      },
      /**
       * @param {TouchEvent} event
       */
      touchend(event) {
        showMessage('Using touchscreens is cheating. Try chasing the button with a mouse.')
        event.preventDefault()
      }
    })
  )
}
