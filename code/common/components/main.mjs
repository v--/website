import { c } from '../component'

import sidebar from './sidebar'
import sidebarToggle from './sidebar_toggle'

export default function body (state) {
  return c('main', null,
    c(sidebarToggle, state),
    c(sidebar, state),
    c(state.factory, state)
  )
}
