import { anchor } from './anchor.ts'
import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { radio } from './radio.ts'
import { type WebsiteLanguageId } from '../languages.ts'
import { spacer } from './spacer.ts'
import { first, map } from '../observable.ts'
import { createComponent as c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { type SidebarId } from '../types/sidebar.ts'

interface ISidebarState {
  sidebarId?: SidebarId
}

export function sidebar({ sidebarId }: ISidebarState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')
  const rootClasses$ = env.sidebarCollapsed$.pipe(
    map(function (sidebarCollapsed) {
      return classlist(
        'sidebar',
        sidebarCollapsed === undefined ? undefined : (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'),
      )
    }),
  )

  return c.html('aside', { class: rootClasses$ },
    c.html('button',
      {
        class: 'sidebar-collapse-button sidebar-entry',
        disabled: !env.isContentDynamic(),
        title: _('sidebar.button.collapse'),
        async click() {
          const current = await first(env.sidebarCollapsed$) ?? env.isSidebarActuallyCollapsed()
          env.sidebarCollapsed$.next(!current)
        },
      },
      c.factory(icon, {
        refId: 'core',
        name: 'solid/chevron-right',
        class: 'sidebar-entry-icon icon-capital-align',
      }),
      c.factory(spacer, { direction: 'horizontal', dynamics: 'pp' }),
      c.html('span', { class: 'sidebar-entry-collapsible-content', text: _('sidebar.button.collapse') }),
    ),

    c.html('hr'),

    c.html('nav', { class: 'sidebar-navigation' },
      c.factory(sidebarNavigationEntry, {
        active: sidebarId === 'home',
        text: _('sidebar.page.home'),
        icon: 'solid/house',
        href: '/',
      }),

      c.factory(sidebarNavigationEntry, {
        active: sidebarId === 'files',
        text: _('sidebar.page.files'),
        icon: 'solid/folder',
        href: '/files',
      }),

      c.factory(sidebarNavigationEntry, {
        active: sidebarId === 'pacman',
        text: _('sidebar.page.pacman'),
        icon: 'solid/download',
        href: '/pacman',
      }),

      c.factory(sidebarNavigationEntry, {
        active: sidebarId === 'playground',
        text: _('sidebar.page.playground'),
        icon: 'solid/code',
        href: '/playground',
      }),
    ),

    c.html('hr'),

    c.html('fieldset',
      {
        class: 'sidebar-entry sidebar-langchange',
        role: 'radiogroup',
        disabled: !env.isContentDynamic(),
      },
      c.html('div', { class: 'sidebar-langchange-icon-wrapper' },
        c.factory(icon, {
          class: 'sidebar-entry-icon icon-capital-align sidebar-langchange-info-icon',
          refId: 'core',
          name: 'solid/language',
        }),
      ),
      c.html('div', { class: 'sidebar-langchange-radio-group sidebar-entry-collapsible-content' },
        ...LANGUAGE_CHOICES.flatMap(langChoice => {
          return c.factory(radio<WebsiteLanguageId>, {
            labelClass: 'sidebar-langchange-radio-label',
            inputClass: 'sidebar-langchange-radio-control',
            content: langChoice.label,
            name: 'sidebar-langchange',
            controlValue: langChoice.language,
            selectedValue: env.gettext.language$,
            async update(newValue: WebsiteLanguageId) {
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

    c.html('hr'),

    c.html('button',
      {
        class: 'sidebar-scheme-toggle-button sidebar-entry',
        disabled: !env.isContentDynamic(),
        title: _('sidebar.button.color_scheme'),
        async click() {
          const current = await first(env.colorScheme$) ?? env.getActualColorScheme()
          env.colorScheme$.next(current === 'light' ? 'dark' : 'light')
        },
      },
      c.factory(icon, {
        refId: 'core',
        name: 'solid/lightbulb',
        class: 'sidebar-entry-icon icon-capital-align',
      }),
      c.factory(spacer, { direction: 'horizontal', dynamics: 'pp' }),
      c.html('span', { class: 'sidebar-entry-collapsible-content', text: _('sidebar.button.color_scheme') }),
    ),
  )
}

interface LanguageChoice {
  language: WebsiteLanguageId
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
  return c.factory(
    anchor,
    {
      href,
      class: 'button-styled-anchor sidebar-entry',
      isInternal: true,
      ariaCurrent: active ? 'page' : 'false',
      title: text,
    },
    c.factory(icon, { refId: 'core', name: iconName, class: 'sidebar-entry-icon icon-capital-align' }),
    c.factory(spacer, { direction: 'horizontal', dynamics: 'pp' }),
    c.html('span', { class: 'sidebar-entry-collapsible-content', text }),
  )
}
