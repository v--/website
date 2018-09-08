import { c } from '../rendering/component'

import sidebar from './sidebar'
import sidebarToggle from './sidebar_toggle'
import loadingIndicator from './loading_indicator'

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
