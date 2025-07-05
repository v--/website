import { anchor } from './anchor.ts'
import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { radio } from './radio.ts'
import { c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type LanguageId } from '../translation.ts'
import { spacer } from './spacer.ts'
import { type ColorScheme, type SidebarId } from '../types/page.ts'

interface ISidebarState {
  sidebarId?: SidebarId
  language: LanguageId
  sidebarCollapsed: boolean
  colorScheme: ColorScheme
}

export function sidebar({ sidebarId, language, sidebarCollapsed, colorScheme }: ISidebarState, env: WebsiteEnvironment) {
  const _ = env.gettext$
  const rootClasses = classlist(
    'sidebar',
    sidebarCollapsed === undefined ? undefined : (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'),
  )

  return c('aside', { class: rootClasses },
    c('button',
      {
        class: 'sidebar-collapse-button sidebar-entry',
        disabled: !env.isContentDynamic(),
        title: _({ bundleId: 'core', key: 'sidebar.button.collapse' }),
        click() {
          const current = sidebarCollapsed ?? env.isSidebarActuallyCollapsed()
          env.sidebarCollapsed$.next(!current)
        },
      },
      c(icon, {
        refId: 'core',
        name: 'solid/chevron-right',
        class: 'sidebar-entry-icon icon-capital-align',
      }),
      c(spacer, { direction: 'horizontal', dynamics: 'pp' }),
      c('span', { class: 'sidebar-entry-collapsible-content', text: _({ bundleId: 'core', key: 'sidebar.button.collapse' }) }),
    ),

    c('hr'),

    c('nav', { class: 'sidebar-navigation' },
      c(sidebarNavigationEntry, {
        active: sidebarId === 'home',
        text: _({ bundleId: 'core', key: 'sidebar.page.home' }),
        icon: 'solid/house',
        href: '/',
      }),

      c(sidebarNavigationEntry, {
        active: sidebarId === 'files',
        text: _({ bundleId: 'core', key: 'sidebar.page.files' }),
        icon: 'solid/folder',
        href: '/files',
      }),

      c(sidebarNavigationEntry, {
        active: sidebarId === 'pacman',
        text: _({ bundleId: 'core', key: 'sidebar.page.pacman' }),
        icon: 'solid/download',
        href: '/pacman',
      }),

      c(sidebarNavigationEntry, {
        active: sidebarId === 'playground',
        text: _({ bundleId: 'core', key: 'sidebar.page.playground' }),
        icon: 'solid/code',
        href: '/playground',
      }),
    ),

    c('hr'),

    c('fieldset',
      {
        class: 'sidebar-entry sidebar-langchange',
        role: 'radiogroup',
        disabled: !env.isContentDynamic(),
      },
      c('div', { class: 'sidebar-langchange-icon-wrapper' },
        c(icon, {
          class: 'sidebar-entry-icon icon-capital-align sidebar-langchange-info-icon',
          refId: 'core',
          name: 'solid/language',
        }),
      ),
      c('div', { class: 'sidebar-langchange-radio-group sidebar-entry-collapsible-content' },
        ...LANGUAGE_CHOICES.flatMap(langChoice => {
          return c(radio, {
            labelClass: 'sidebar-langchange-radio-label',
            inputClass: 'sidebar-langchange-radio-control',
            content: langChoice.label,
            name: 'sidebar-langchange',
            controlValue: langChoice.language,
            selectedValue: language,
            async update(newValue: LanguageId) {
              env.loading$.next(true)

              try {
                await env.changeLanguage(newValue)
              } finally {
                env.loading$.next(false)
              }
            },
          })
        }),
      ),
    ),

    c('hr'),

    c('button',
      {
        class: 'sidebar-scheme-toggle-button sidebar-entry',
        disabled: !env.isContentDynamic(),
        title: _({ bundleId: 'core', key: 'sidebar.button.color_scheme' }),
        click() {
          const realScheme = colorScheme ?? env.getActualColorScheme()
          env.colorScheme$.next(realScheme === 'light' ? 'dark' : 'light')
        },
      },
      c(icon, {
        refId: 'core',
        name: 'solid/lightbulb',
        class: 'sidebar-entry-icon icon-capital-align',
      }),
      c(spacer, { direction: 'horizontal', dynamics: 'pp' }),
      c('span', { class: 'sidebar-entry-collapsible-content', text: _({ bundleId: 'core', key: 'sidebar.button.color_scheme' }) }),
    ),
  )
}

interface LanguageChoice {
  language: LanguageId
  label: string
}

const LANGUAGE_CHOICES: LanguageChoice[] = [
  { language: 'en', label: 'ENG' },
  { language: 'ru', label: 'РУС' },
]

interface IEntryState {
  active: boolean
  text: string
  icon: string
  href: string
}

function sidebarNavigationEntry({ active, text, icon: iconName, href }: IEntryState) {
  return c(
    anchor,
    {
      href,
      class: 'button-styled-anchor sidebar-entry',
      isInternal: true,
      ariaCurrent: active ? 'page' : 'false',
      title: text,
    },
    c(icon, { refId: 'core', name: iconName, class: 'sidebar-entry-icon icon-capital-align' }),
    c(spacer, { direction: 'horizontal', dynamics: 'pp' }),
    c('span', { class: 'sidebar-entry-collapsible-content', text }),
  )
}
