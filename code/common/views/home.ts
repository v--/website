import { c } from '../rendering/component.js'
import { PAGE_DESCRIPTIONS } from '../constants/page_descriptions.js'

import { icon } from '../components/icon.js'
import { link } from '../components/link.js'
import { pgpLink } from '../components/pgp_link.js'
import { sectionTitle } from '../components/section_title.js'

function siteSection(state: { text: string, link: string }) {
  return c('li', undefined,
    c('b', undefined, c(link, { link: state.link, isInternal: true })),
    c('span', { text: ': ' + state.text })
  )
}

function contact(state: { link: string, icon: string, text: string }) {
  return c('li', { class: 'contact' },
    c(link, { link: state.link },
      c(icon, { name: state.icon }),
      c('span', { text: state.text })
    )
  )
}

export function home() {
  return c('div', { class: 'page home-page' },
    c('div', { class: 'about-me' },
      c('div', { class: 'me-irl' }),
      c('div', { class: 'contacts' },
        c(sectionTitle, { text: 'Contacts' }),
        c('ul', undefined,
          c(contact, {
            text: 'Email',
            icon: 'email',
            link: 'mailto:ianis@ivasilev.net'
          }),

          c(contact, {
            text: 'Facebook',
            icon: 'facebook',
            link: 'https://www.facebook.com/ianis.vasilev'
          }),

          c(contact, {
            text: 'GitHub',
            icon: 'github',
            link: 'https://github.com/v--'
          }),

          c(contact, {
            text: 'Reddit',
            icon: 'reddit',
            link: 'https://www.reddit.com/user/IanisVasilev'
          })
        ),

        c('p', undefined,
          c('span', {
            text: 'PGP public key: '
          }),
          c(pgpLink, {})
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
        c('ul', { class: 'cool-list' },
          c(siteSection, {
            link: '/files',
            text: PAGE_DESCRIPTIONS.files
          }),

          c(siteSection, {
            link: '/pacman',
            text: PAGE_DESCRIPTIONS.pacman
          }),

          c(siteSection, {
            link: '/playground',
            text: PAGE_DESCRIPTIONS.playground.index
          })
        ),

        c('p', undefined,
          c('b', { text: 'Technical note: ' }),
          c('span', { text: "Except for the playground, most of the website is static and works without JavaScript. However, it still benefits from having a full-fledged home-grown lightweight (~1K LoC) frontend rendering engine. The code has no external dependencies and so things like observables and markdown/FOL parsers are also implemented from scratch. There are also a lot of symbolic and numeric mathematical algorithms implemented in pure JavaScript. The frontend code is neither precompiled nor bundled and can be easily explored using any browser's developer tools. It is licensed under " }),
          c(link, { text: 'the Unlicense', link: 'https://unlicense.org/' }),
          c('span', { text: '.' })
        )
      )
    )
  )
}
