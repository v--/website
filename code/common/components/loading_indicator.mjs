import { c } from '../component'

export default function loadingIndicator () {
  return c('div', { class: 'loading-indicator-wrapper' },
    c('div', {
      class: 'loading-indicator',
      text: 'Loading'
    })
  )
}
