import { c } from '../rendering/component.js'
import { PAGE_DESCRIPTIONS } from '../constants/page_descriptions.js'

import { icon } from '../components/icon.js'
import { anchor } from '../components/anchor.js'
import { pgpAnchor } from '../components/pgp_anchor.js'
import { sectionTitle } from '../components/section_title.js'

export function home() {
  return c('div', { class: 'page home-page' },
    c('div', { class: 'about-me' },
      c('div', { class: 'me-irl' }),
      c('div', { class: 'contacts' },
        c(sectionTitle, { text: 'Contacts' }),
        c('div', undefined,
          c('div', { class: 'contact' },
            c(anchor, { href: 'mailto:ianis@ivasilev.net' },
              c(icon, { name: 'solid/envelope' }),
              c('span', { text: 'Email' })
            )
          ),

          c('div', { class: 'contact' },
            c(anchor, { href: 'https://t.me/ianis_vasilev' },
              c(icon, { name: 'brands/telegram' }),
              c('span', { text: 'Telegram' })
            )
          ),

          c('div', { class: 'contact' },
            c(anchor, { href: 'https://pub.ivasilev.net/@ianis', rel: 'me' },
              c(icon, { name: 'brands/mastodon' }),
              c('span', { text: 'Mastodon' })
            )
          ),

          c('div', { class: 'contact' },
            c(anchor, { href: 'https://www.facebook.com/ianis.vasilev' },
              c(icon, { name: 'brands/facebook' }),
              c('span', { text: 'Facebook' })
            )
          ),

          c('div', { class: 'contact' },
            c(anchor, { href: 'https://github.com/v--' },
              c(icon, { name: 'brands/github' }),
              c('span', { text: 'GitHub' })
            )
          ),

          c('div', { class: 'contact' },
            c(anchor, { href: 'https://www.reddit.com/user/IanisVasilev' },
              c(icon, { name: 'brands/reddit' }),
              c('span', { text: 'Reddit' })
            )
          ),

          c('div', { class: 'contact' },
            c(anchor, { href: 'https://www.skypixel.com/users/djiuser-i6pxbyamfci5' },
              c(icon, { name: 'solid/camera' }),
              c('span', { text: 'SkyPixel' })
            )
          )
        ),

        c('p', { class: 'pgp-info' },
          c('span', {
            text: 'PGP public key: '
          }),
          c(pgpAnchor, {})
        )
      )
    ),

    c('article', { class: 'info' },
      c('div', { class: 'me-irl' }),

      c('div', undefined,
        c(sectionTitle, { text: 'About me' }),
        c('p', {
          text: 'My name is Ianis Vasilev. I am a statistician according to my diploma, a programmer according to my contract, a musician according to my ego and a trail runner according to my legs.'
        })
      ),

      c('div', undefined,
        c(sectionTitle, { text: 'About this website' }),
        c('p', { text: 'This is my personal website. It contains a few diverse sections:' }),
        c('dl', { class: 'cool-list' },
          c('dt', undefined,
            c(anchor, {
              href: '/files',
              isInternal: true
            })
          ),
          c('dd', { text: PAGE_DESCRIPTIONS.files + '.' }),

          c('dt', undefined,
            c(anchor, {
              href: '/pacman',
              isInternal: true
            })
          ),
          c('dd', { text: PAGE_DESCRIPTIONS.pacman + '.' }),

          c('dt', undefined,
            c(anchor, {
              href: '/playground',
              isInternal: true
            })
          ),
          c('dd', { text: PAGE_DESCRIPTIONS.playground.index + '.' })
        )
      )
    )
  )
}
