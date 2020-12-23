import { classlist } from '../support/dom_properties.js'
import { SidebarId } from '../enums/sidebar_id.js'
import { c } from '../rendering/component.js'

import { icon } from './icon.js'
import { link } from './link.js'
import { RouterState } from '../support/router_state.js'
import { Action } from '../types/typecons.js'

export function sidebar({ sidebarId, isCollapsed, toggleCollapsed }: RouterState) {
  function entry(state: {
    id: SidebarId,
    text: string,
    icon: string,
    link: string
  }) {
    const classes = classlist('cool-button', 'entry', sidebarId === state.id && 'active')

    return c(link, { class: classes, link: state.link, isInternal: true },
      c(icon, { class: 'entry-icon', name: state.icon }),
      c('span', { class: 'entry-text', text: state.text })
    )
  }

  const toggleButtonState: {
    class: string,
    disabled?: boolean,
    click?: Action<MouseEvent>
  } = {
    class: 'cool-button entry'
  }

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
      id: SidebarId.home,
      text: 'Home page',
      icon: 'home',
      link: '/'
    }),

    c(entry, {
      id: SidebarId.files,
      text: 'File server',
      icon: 'folder',
      link: '/files'
    }),

    c(entry, {
      id: SidebarId.pacman,
      text: 'Pacman repo',
      icon: 'download',
      link: '/pacman'
    }),

    c(entry, {
      id: SidebarId.playground,
      text: 'Playground',
      icon: 'code-greater-than',
      link: '/playground'
    })
  )
}
