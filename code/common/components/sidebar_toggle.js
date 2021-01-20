import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'

import { icon } from './icon.js'

/**
 * @param {TRouter.IRouterStatePartial} state
 */
export function sidebarToggle({ isCollapsed, toggleCollapsed }) {
  return c(icon, {
    name: 'chevron-left',
    class: classlist('cool-button', 'sidebar-toggle', isCollapsed && 'collapsed'),
    click: toggleCollapsed
  })
}
