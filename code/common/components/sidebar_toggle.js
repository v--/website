import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

import icon from './icon.js'

export default function sidebarToggle ({ isCollapsed, toggleCollapsed }) {
  return c(icon, {
    name: 'chevron-left',
    class: classlist('sidebar-toggle', isCollapsed && 'collapsed'),
    click: toggleCollapsed
  })
}
