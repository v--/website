import { c } from '../rendering/component.mjs'

import sidebar from './sidebar.mjs'
import sidebarToggle from './sidebar_toggle.mjs'
import loadingIndicator from './loading_indicator.mjs'

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
