import { c } from '../rendering/component.js'
import { styles } from '../support/dom_properties.js'

export function loadingIndicator ({ visible }) {
  return c(
    'div',
    {
      class: 'loading-indicator-wrapper',
      style: styles({ visibility: visible ? 'visible' : 'hidden' })
    },
    c('div', {
      class: 'loading-indicator',
      text: 'Loading'
    })
  )
}
