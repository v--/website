import { c } from '../rendering/component'
import { classlist } from '../support/dom_properties'

import icon from './icon'

export default function sidebarToggle ({ isCollapsed, toggleCollapsed }) {
  return c(icon, {
    name: 'chevron-left',
    class: classlist('sidebar-toggle', isCollapsed && 'collapsed'),
    click: toggleCollapsed
  })
}
