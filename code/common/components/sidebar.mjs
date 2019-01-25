import { classlist } from '../support/dom_properties.mjs'
import SidebarID from '../enums/sidebar_id.mjs'
import { c } from '../rendering/component.mjs'

import icon from './icon.mjs'
import link from './link.mjs'

export default function sidebar ({ sidebarID, isCollapsed, toggleCollapsed }) {
  function entry (state) {
    const classes = classlist('button', 'entry', sidebarID === state.id && 'active')

    return c(link, { class: classes, link: state.link, isInternal: true },
      c(icon, { class: 'entry-icon', name: state.icon }),
      c('span', { class: 'entry-text', text: state.text })
    )
  }

  const toggleButtonState = { class: 'entry' }

  if (toggleCollapsed === undefined) {
    toggleButtonState.disabled = true
  } else {
    toggleButtonState.click = toggleCollapsed
  }

  return c('aside', { class: classlist('sidebar', isCollapsed && 'collapsed') },
    c('button', toggleButtonState,
      c(icon, { class: 'entry-icon', name: 'chevron-left' }),
      c('span', { class: 'entry-text', text: 'Hide sidebar' })
    ),

    c(entry, {
      id: SidebarID.HOME,
      text: 'Home page',
      icon: 'home',
      link: '/'
    }),

    c(entry, {
      id: SidebarID.FILES,
      text: 'File server',
      icon: 'folder',
      link: '/files'
    }),

    c(entry, {
      id: SidebarID.PACMAN,
      text: 'Pacman repo',
      icon: 'download',
      link: '/pacman'
    }),

    c(entry, {
      id: SidebarID.PLAYGROUND,
      text: 'Playground',
      icon: 'code-greater-than',
      link: '/playground'
    })
  )
}
