import { anchor } from './anchor.ts'
import { button } from './button.ts'
import { icon } from './icon.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { radio } from './radio.ts'
import { type WebsiteLanguageId } from '../languages.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type NavigationId } from '../types/page.ts'

interface INavigationState {
  navId?: NavigationId
}

export function mainMenu({ navId }: INavigationState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('core')

  return c.html('menu', { class: 'main-menu' },
    c.html('li', undefined,
      c.html('nav', { class: 'main-menu-navigation' },
        c.factory(mainMenuEntry, {
          active: navId === 'home',
          text: _('main_menu.page.home'),
          icon: 'solid/house',
          href: '/',
        }),

        c.factory(mainMenuEntry, {
          active: navId === 'files',
          text: _('main_menu.page.files'),
          icon: 'solid/folder',
          href: '/files',
        }),

        c.factory(mainMenuEntry, {
          active: navId === 'pacman',
          text: _('main_menu.page.pacman'),
          icon: 'solid/download',
          href: '/pacman',
        }),

        c.factory(mainMenuEntry, {
          active: navId === 'playground',
          text: _('main_menu.page.playground'),
          icon: 'solid/code',
          href: '/playground',
        }),
      ),
    ),

    c.html('li', undefined,
      c.html('hr'),

      c.html('fieldset',
        {
          class: 'main-menu-entry main-menu-lang-toggle',
          role: 'radiogroup',
          disabled: !env.isContentDynamic(),
        },
        ...LANGUAGE_CHOICES.flatMap(langChoice => {
          return c.factory(radio<WebsiteLanguageId>, {
            labelClass: 'main-menu-lang-toggle-label',
            inputClass: 'main-menu-lang-toggle-control',
            content: langChoice.label,
            name: 'main-menu-lang',
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

      c.html('hr'),

      c.factory(button,
        {
          class: 'main-menu-color-toggle main-menu-entry',
          disabled: !env.isContentDynamic(),
          text: _('main_menu.button.color_scheme'),
          iconLibId: 'core',
          iconName: 'solid/lightbulb',
          async click() {
            await env.toggleColorScheme()
          },
        },
      ),
    ),
  )
}

interface LanguageChoice {
  language: WebsiteLanguageId
  label: string
}

const LANGUAGE_CHOICES: LanguageChoice[] = [
  { language: 'en', label: 'English' },
  { language: 'ru', label: 'Русский' },
]

interface IEntryState {
  active: boolean
  text: string
  icon: string
  href: string
}

function mainMenuEntry({ active, text, icon: iconName, href }: IEntryState) {
  return c.factory(
    anchor,
    {
      href,
      class: 'main-menu-entry button-styled-anchor button-with-icon',
      isInternal: true,
      ariaCurrent: active ? 'page' : 'false',
      title: text,
    },
    c.factory(icon, { libId: 'core', name: iconName }),
    c.html('span', { text }),
  )
}
