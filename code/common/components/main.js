import { c } from '../rendering/component.js'

import sidebar from './sidebar.js'
import sidebarToggle from './sidebar_toggle.js'
import loadingIndicator from './loading_indicator.js'

export default function main (state) {
  return c('main', null,
    c(sidebarToggle, state),
    c(sidebar, state),
    c('div', { class: 'page-wrapper' },
      c(loadingIndicator, { visible: state.loading }),
      state.factory && c(state.factory, state)
    )
  )
}
