import { c } from '../rendering/component.mjs'
import { classlist } from '../support/dom_properties.mjs'

import icon from './icon.mjs'

export default function sidebarToggle ({ isCollapsed, toggleCollapsed }) {
  return c(icon, {
    name: 'chevron-left',
    class: classlist('sidebar-toggle', isCollapsed && 'collapsed'),
    click: toggleCollapsed
  })
}
