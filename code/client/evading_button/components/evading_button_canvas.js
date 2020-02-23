import { c } from '../../../common/rendering/component.js'
import { styles } from '../../../common/support/dom_properties.js'

export function evadingButtonCanvas ({ canvas, button }) {
  return c('div', { class: 'evading-button-canvas' },
    c('button', {
      class: 'cool-button evading-button',
      text: 'Click me',
      style: styles({
        left: canvas === null ? '0' : (button.origin.x - canvas.origin.x) + 'px',
        top: canvas === null ? '0' : (button.origin.y - canvas.origin.y) + 'px'
      })
    })
  )
}
