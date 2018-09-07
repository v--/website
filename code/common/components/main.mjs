import { c } from '../component'

import sidebar from './sidebar'
import sidebarToggle from './sidebar_toggle'
import loadingIndicator from './loading_indicator'

export default function body (state) {
  return c('main', null,
    c(sidebarToggle, state),
    c(sidebar, state),
    c('div', { class: 'page-wrapper' },
      state.factory && c(state.factory, state),
      state.loading && c(loadingIndicator, state)
    )
  )
}
