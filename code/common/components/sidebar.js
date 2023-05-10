import { classlist } from '../support/dom_properties.js'
import { c } from '../rendering/component.js'

import { icon } from './icon.js'
import { anchor } from './anchor.js'

/**
 * @param {TRouter.IRouterStatePartial} state
 */
export function sidebar({ sidebarId, isCollapsed, toggleCollapsed, darkScheme, toggleDarkScheme }) {
  /**
   * @param {{
   *   id: string,
   *   text: string,
   *   icon: string,
   *   href: string
   * }} state
   */
  function entry(state) {
    const classes = classlist('cool-button', 'entry', sidebarId === state.id && 'active')

    return c(anchor, { class: classes, href: state.href, isInternal: true },
      c(icon, { class: 'entry-icon', name: state.icon }),
      c('span', { class: 'entry-text', text: state.text })
    )
  }

  /** @type {{
   *   class: string,
   *   disabled?: boolean,
   *   click?: () => void
   * }}
   */
  const sidebarToggleButtonState = {
    class: 'cool-button toggle-sidebar-button entry'
  }

  if (toggleCollapsed === undefined) {
    sidebarToggleButtonState.disabled = true
  } else {
    sidebarToggleButtonState.click = toggleCollapsed
  }

  /** @type {{
   *   class: string,
   *   disabled?: boolean,
   *   click?: () => void
   * }}
   */
  const darkSchemeButtonState = {
    class: 'cool-button toggle-scheme-button entry'
  }

  if (toggleDarkScheme === undefined) {
    darkSchemeButtonState.disabled = true
  } else {
    darkSchemeButtonState.click = toggleDarkScheme
  }

  return c('aside', { class: classlist('sidebar', isCollapsed && 'collapsed') },
    c('button', sidebarToggleButtonState,
      c(icon, { class: 'entry-icon', name: 'solid/chevron-left' }),
      c('span', { class: 'entry-text', text: 'Hide sidebar' })
    ),

    c('hr'),

    c(entry, {
      id: 'home',
      text: 'Home page',
      icon: 'solid/house',
      href: '/'
    }),

    c(entry, {
      id: 'files',
      text: 'File server',
      icon: 'solid/folder',
      href: '/files'
    }),

    c(entry, {
      id: 'pacman',
      text: 'Pacman repo',
      icon: 'solid/download',
      href: '/pacman'
    }),

    c(entry, {
      id: 'playground',
      text: 'Playground',
      icon: 'solid/code',
      href: '/playground'
    }),

    c('div', { class: 'spacer' }),
    c('hr'),
    c('button', darkSchemeButtonState,
      c(icon, { class: 'entry-icon', name: 'solid/lightbulb' }),
      c('span', { class: 'entry-text', text: darkScheme ? 'Light scheme' : 'Dark scheme' })
    )
  )
}
