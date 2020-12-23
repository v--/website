import { c } from '../rendering/component.js'

import { sidebar } from './sidebar.js'
import { sidebarToggle } from './sidebar_toggle.js'
import { loadingIndicator } from './loading_indicator.js'
import { RouterState } from '../support/router_state.js'

export function main(state: RouterState) {
  return c('main', undefined,
    c(sidebarToggle, state),
    c(sidebar, state),
    c('div', { class: 'page-wrapper' },
      c(loadingIndicator, { visible: state.loading }),
      typeof state.factory === 'function' && c(state.factory, state as RouterState)
    )
  )
}
