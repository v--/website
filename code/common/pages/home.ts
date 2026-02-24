import { anchor } from '../components/anchor.ts'
import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import { spacer } from '../components/spacer.ts'
import {
  EMAIL_URL,
  GITHUB_PROJECT_URL,
  GITHUB_PROJECT_CODE_URL,
  GITHUB_USER_URL,
  MASTODON_URL,
  OPENPGP_KEYSERVER_URL,
  OPENPGP_KEY_ID_SHORT,
  TELEGRAM_URL,
} from '../constants/url.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function homePage(pageState: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('home')

  return c.html('main', { class: 'home-page' },
    c.html('img', {
      class: 'home-page-photo',
      alt: _('photo.alt'),
      src: '/images/home_page_photo.jpg',
    }),

    c.html('section', { class: 'home-page-about' },
      c.html('h1', { text: _('heading.about_me') }),
      c.factory(rich, { doc: _.rich$({ key: 'bio' }) }),

      c.html('h1', { text: _('heading.about_website') }),
      c.factory(rich, { doc: _.rich$({ key: 'website_description' }) }),

      c.html('p', { text: _('page_list_prefix') }),
      c.html('dl', undefined,
        c.html('dt', undefined,
          c.factory(anchor, {
            href: '/files',
            isInternal: true,
          }),
        ),
        c.html('dd', { text: _({ bundleId: 'core', key: 'description.files' }) }),

        c.html('dt', undefined,
          c.factory(anchor, {
            href: '/pacman',
            isInternal: true,
          }),
        ),
        c.html('dd', { text: _({ bundleId: 'core', key: 'description.pacman' }) }),

        c.html('dt', undefined,
          c.factory(anchor, {
            href: '/playground',
            isInternal: true,
          }),
        ),
        c.html('dd', { text: _({ bundleId: 'core', key: 'description.playground' }) }),
      ),
      c.factory(rich, {
        doc: _.rich$({
          key: 'website_code',
          context: {
            projectUrl: GITHUB_PROJECT_URL,
            reactiveRenderingUrl: `${GITHUB_PROJECT_CODE_URL}/common/rendering`,
          },
        }),
      }),
    ),

    c.html('section', { class: 'home-page-contacts' },
      c.html('h1', { text: _('heading.contacts') }),
      c.html('div', undefined,
        c.html('div', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { href: EMAIL_URL },
            c.factory(icon, { refId: 'contacts', name: 'solid/envelope' }),
            c.factory(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c.html('span', { text: 'Email' }),
          ),
        ),

        c.html('div', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { href: TELEGRAM_URL },
            c.factory(icon, { refId: 'contacts', name: 'brands/telegram' }),
            c.factory(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c.html('span', { text: 'Telegram' }),
          ),
        ),

        c.html('div', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { href: MASTODON_URL, rel: 'me' },
            c.factory(icon, { refId: 'contacts', name: 'brands/mastodon' }),
            c.factory(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c.html('span', { text: 'Mastodon' }),
          ),
        ),

        c.html('div', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { href: GITHUB_USER_URL },
            c.factory(icon, { refId: 'contacts', name: 'brands/github' }),
            c.factory(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c.html('span', { text: 'GitHub' }),
          ),
        ),

        c.factory(spacer, { dynamics: 'pp' }),

        c.factory(rich, {
          doc: _.rich$({
            key: 'openpgp',
            context: { keyName: OPENPGP_KEY_ID_SHORT, keyUrl: OPENPGP_KEYSERVER_URL },
          }),
        }),
      ),
    ),
  )
}
