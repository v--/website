import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

import { icon } from './icon.js'

export function sidebarToggle ({ isCollapsed, toggleCollapsed }) {
  return c(icon, {
    name: 'chevron-left',
    class: classlist('button', 'sidebar-toggle', isCollapsed && 'collapsed'),
    click: toggleCollapsed
  })
}
