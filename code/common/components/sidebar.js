import { classlist } from '../support/dom_properties.js'
import { c } from '../rendering/component.js'

import { icon } from './icon.js'
import { link } from './link.js'

/**
 * @param {TRouter.IRouterStatePartial} state
 */
export function sidebar({ sidebarId, isCollapsed, toggleCollapsed }) {
  /**
   * @param {{
   *   id: string,
   *   text: string,
   *   icon: string,
   *   link: string
   * }} state
   */
  function entry(state) {
    const classes = classlist('cool-button', 'entry', sidebarId === state.id && 'active')

    return c(link, { class: classes, link: state.link, isInternal: true },
      c(icon, { class: 'entry-icon', name: state.icon }),
      c('span', { class: 'entry-text', text: state.text })
    )
  }

  /** @type {{
   *   class: string,
   *   disabled?: boolean,
   *   click?: TCons.Action<MouseEvent>
   * }}
   */
  const toggleButtonState = {
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
      id: 'home',
      text: 'Home page',
      icon: 'home',
      link: '/'
    }),

    c(entry, {
      id: 'files',
      text: 'File server',
      icon: 'folder',
      link: '/files'
    }),

    c(entry, {
      id: 'pacman',
      text: 'Pacman repo',
      icon: 'download',
      link: '/pacman'
    }),

    c(entry, {
      id: 'playground',
      text: 'Playground',
      icon: 'code-greater-than',
      link: '/playground'
    })
  )
}
