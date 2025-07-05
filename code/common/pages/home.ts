import { anchor } from '../components/anchor.ts'
import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import { spacer } from '../components/spacer.ts'
import {
  EMAIL_URL,
  GITHUB_PROJECT_URL,
  GITHUB_USER_URL,
  MASTODON_URL,
  OPENPGP_KEYSERVER_URL,
  OPENPGP_KEY_ID_SHORT,
  TELEGRAM_URL,
} from '../constants/url.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function homePage(pageState: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext$

  return c('main', { class: 'home-page' },
    c('img', {
      class: 'home-page-photo',
      alt: _({ bundleId: 'home', key: 'photo.alt' }),
      src: '/images/home_page_photo.jpg',
    }),

    c('article', { class: 'home-page-about' },
      c('section', { class: 'home-page-about-me' },
        c('h1', { text: _({ bundleId: 'home', key: 'heading.about_me' }) }),
        c(rich, { doc: _({ bundleId: 'home', key: 'bio' }, { rich: true }) }),
      ),

      c('section', { class: 'home-page-about-website' },
        c('h1', { text: _({ bundleId: 'home', key: 'heading.about_website' }) }),
        c(rich, { doc: _({ bundleId: 'home', key: 'website_description' }, { rich: true }) }),
        c('p', { text: _({ bundleId: 'home', key: 'page_list_prefix' }) }),
        c('dl', undefined,
          c('dt', undefined,
            c(anchor, {
              href: '/files',
              isInternal: true,
            }),
          ),
          c('dd', { text: _({ bundleId: 'core', key: 'description.files' }) }),

          c('dt', undefined,
            c(anchor, {
              href: '/pacman',
              isInternal: true,
            }),
          ),
          c('dd', { text: _({ bundleId: 'core', key: 'description.pacman' }) }),

          c('dt', undefined,
            c(anchor, {
              href: '/playground',
              isInternal: true,
            }),
          ),
          c('dd', { text: _({ bundleId: 'core', key: 'description.playground' }) }),
        ),
        c(rich, {
          doc: _(
            {
              bundleId: 'home', key: 'website_code',
              context: { githubProjectUrl: GITHUB_PROJECT_URL },
            },
            { rich: true },
          ),
        }),
      ),
    ),

    c('section', { class: 'home-page-contacts' },
      c('h1', { text: _({ bundleId: 'home', key: 'heading.contacts' }) }),
      c('div', undefined,
        c('div', { class: 'home-page-contacts-entry' },
          c(anchor, { href: EMAIL_URL },
            c(icon, { refId: 'contacts', name: 'solid/envelope' }),
            c(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c('span', { text: 'Email' }),
          ),
        ),

        c('div', { class: 'home-page-contacts-entry' },
          c(anchor, { href: TELEGRAM_URL },
            c(icon, { refId: 'contacts', name: 'brands/telegram' }),
            c(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c('span', { text: 'Telegram' }),
          ),
        ),

        c('div', { class: 'home-page-contacts-entry' },
          c(anchor, { href: MASTODON_URL, rel: 'me' },
            c(icon, { refId: 'contacts', name: 'brands/mastodon' }),
            c(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c('span', { text: 'Mastodon' }),
          ),
        ),

        c('div', { class: 'home-page-contacts-entry' },
          c(anchor, { href: GITHUB_USER_URL },
            c(icon, { refId: 'contacts', name: 'brands/github' }),
            c(spacer, { direction: 'horizontal', dynamics: 'p' }),
            c('span', { text: 'GitHub' }),
          ),
        ),

        c(spacer, { dynamics: 'pp' }),

        c(rich, {
          doc: _(
            {
              bundleId: 'home',
              key: 'openpgp',
              context: { keyName: OPENPGP_KEY_ID_SHORT, keyUrl: OPENPGP_KEYSERVER_URL },
            },
            { rich: true },
          ),
        }),
      ),
    ),
  )
}
