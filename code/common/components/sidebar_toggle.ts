import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { RouterState } from '../support/router_state.js'

import { icon } from './icon.js'

export function sidebarToggle({ isCollapsed, toggleCollapsed }: RouterState) {
  return c(icon, {
    name: 'chevron-left',
    class: classlist('cool-button', 'sidebar-toggle', isCollapsed && 'collapsed'),
    click: toggleCollapsed
  })
}
