import { c } from '../../../common/rendering/component.js'
import { styles } from '../../../common/support/dom_properties.js'

export function evadingButtonCanvas ({ buttonOrigin }) {
  return c('div', { class: 'evading-button-canvas' },
    c('button', {
      class: 'cool-button evading-button',
      text: 'Click me',
      style: styles({
        left: buttonOrigin === null ? '0' : 100 * buttonOrigin.x + '%',
        top: buttonOrigin === null ? '0' : 100 * buttonOrigin.y + '%'
      }),
      click (_event) {
        window.alert('You have won!')
      }
    })
  )
}
