import { c } from '../rendering/component.js'

import { sidebar } from './sidebar.js'
import { sidebarToggle } from './sidebar_toggle.js'
import { loadingIndicator } from './loading_indicator.js'

/**
 * @param {TRouter.IRouterStatePartial} state
 */
export function main(state) {
  return c('main', undefined,
    c(sidebarToggle, state),
    c(sidebar, state),
    c('div', { class: 'page-wrapper' },
      c(loadingIndicator, { visible: state.loading === true /* we consider undefined as "server-rendered" */ }),
      typeof state.factory === 'function' && c(state.factory, /** @type {TRouter.IRouterState} */ (state))
    )
  )
}
