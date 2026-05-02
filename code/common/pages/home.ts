import { anchor } from '../components/anchor.ts'
import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import {
  EMAIL_URL,
  GITHUB_PROJECT_CODE_URL,
  GITHUB_PROJECT_URL,
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
      c.html('ul', { class: 'home-page-contacts-list' },
        c.html('li', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { class: 'anchor-with-icon', href: EMAIL_URL },
            c.factory(icon, { libId: 'contacts', name: 'email' }),
            c.html('span', { text: _('contacts.email.label') }),
          ),
        ),

        c.html('li', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { class: 'anchor-with-icon', href: TELEGRAM_URL },
            c.factory(icon, { libId: 'contacts', name: 'telegram' }),
            c.html('span', { text: 'Telegram' }),
          ),
        ),

        c.html('li', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { class: 'anchor-with-icon', href: MASTODON_URL, rel: 'me' },
            c.factory(icon, { libId: 'contacts', name: 'mastodon' }),
            c.html('span', { text: 'Mastodon' }),
          ),
        ),

        c.html('li', { class: 'home-page-contacts-entry' },
          c.factory(anchor, { class: 'anchor-with-icon', href: GITHUB_USER_URL },
            c.factory(icon, { libId: 'contacts', name: 'github' }),
            c.html('span', { text: 'GitHub' }),
          ),
        ),
      ),

      c.html('p', { class: 'home-page-openpgp-message' },
        c.html('div', { text: _({ key: 'openpgp.label' }) }),
        c.factory(anchor, { href: OPENPGP_KEYSERVER_URL },
          c.html('code', { text: OPENPGP_KEY_ID_SHORT }),
        ),
      ),
    ),
  )
}
