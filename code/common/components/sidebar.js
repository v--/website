import { classlist } from '../support/dom_properties.js'
import { SidebarId } from '../enums/sidebar_id.js'
import { c } from '../rendering/component.js'

import { icon } from './icon.js'
import { link } from './link.js'

export function sidebar ({ sidebarID, isCollapsed, toggleCollapsed }) {
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
      id: SidebarId.HOME,
      text: 'Home page',
      icon: 'home',
      link: '/'
    }),

    c(entry, {
      id: SidebarId.FILES,
      text: 'File server',
      icon: 'folder',
      link: '/files'
    }),

    c(entry, {
      id: SidebarId.PACMAN,
      text: 'Pacman repo',
      icon: 'download',
      link: '/pacman'
    }),

    c(entry, {
      id: SidebarId.PLAYGROUND,
      text: 'Playground',
      icon: 'code-greater-than',
      link: '/playground'
    })
  )
}
