import { c } from '../rendering/component.js'

import icon from '../components/icon.js'
import link from '../components/link.js'

function siteSection (state) {
  return c('li', null,
    c('b', null, c(link, { link: state.link, isInternal: true })),
    c('span', { text: ': ' + state.text })
  )
}

function contact (state) {
  return c('li', { class: 'contact' },
    c(link, { link: state.link },
      c(icon, { name: state.icon }),
      c('span', { text: state.text })
    )
  )
}

export default function home () {
  return c('div', { class: 'page home-page' },
    c('div', { class: 'me-irl' },
      c('div', { class: 'me-irl-pre' }),
      c('img', { class: 'me-irl-img', src: 'images/me_irl.jpg' }),
      c('div', { class: 'me-irl-post' })
    ),

    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'About me' }),
      c('p', {
        text: 'My name is Ianis Vasilev. I consider myself a simple man with complicated interests. I am a statistician according to my diploma, a programmer according to my contract, a musician according to my ego and a trail runner according to my legs.'
      })
    ),

    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'About this website' }),
      c('p', { text: 'This is my personal website. It contains a few diverse sections:' }),
      c('ul', null,
        c(siteSection, {
          link: '/files',
          text: 'a file explorer for a server containing math notes, presentation slides, musical scores and a few other miscellaneous files.'
        }),

        c(siteSection, {
          link: '/pacman',
          text: 'information about a pacman repository hosted under the same domain name as the website.'
        }),

        c(siteSection, {
          link: '/playground',
          text: 'interactive browser-based simulations and visualizations.'
        })
      ),

      c('p', null,
        c('b', { text: 'Technical note: ' }),
        c('span', { text: "Except for the playground, most of the website is static and works without JavaScript. However, it still benefits from having a full-fledged home-grown lightweight (~1K LoC) frontend rendering engine. The code has no external dependencies and so things like observables and markdown/FOL parsers are also implemented from scratch. The frontend code is neither precompiled nor bundled and can be easily explored using any browser's developer tools. It is licensed under " }),
        c(link, { text: 'the Unlicense', link: 'https://unlicense.org/' }),
        c('span', { text: '.' })
      )
    ),

    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Contacts' }),
      c('ul', null,
        c(contact, {
          text: 'Email',
          icon: 'email',
          link: 'mailto:ianis@ivasilev.net'
        }),

        c(contact, {
          text: 'GitHub',
          icon: 'github-circle',
          link: 'https://github.com/v--'
        }),

        c(contact, {
          text: 'Facebook',
          icon: 'facebook',
          link: 'https://www.facebook.com/ianis.vasilev'
        })
      )
    )
  )
}
