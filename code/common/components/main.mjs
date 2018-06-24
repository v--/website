import { c } from '../component'
import classlist from '../support/classlist'

import sidebar from './sidebar'
import sidebarToggle from './sidebar_toggle'

export default function body (state) {
  return c('main', { class: classlist(state.loading && 'loading') },
    c(sidebarToggle, state),
    c(sidebar, state),
    c(state.factory, state)
  )
}
