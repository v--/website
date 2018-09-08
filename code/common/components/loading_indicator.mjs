import { c } from '../rendering/component.mjs'
import { styles } from '../support/dom_properties.mjs'

export default function loadingIndicator ({ visible }) {
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
