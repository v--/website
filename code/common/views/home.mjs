import { c } from '../rendering/component.mjs'

import icon from '../components/icon.mjs'
import link from '../components/link.mjs'

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
    c('div', { class: 'section' },
      c('div', { class: 'me-irl' },
        c('div', { class: 'me-irl-pre' }),
        c('img', { class: 'me-irl-img', src: 'images/me_irl.jpg', alt: 'A photo of me.' }),
        c('div', { class: 'me-irl-post' })
      ),

      c('h1', { class: 'section-title', text: 'Welcome!' }),
      c('p', {
        text: 'This is my personal website - nothing more.'
      })
    ),

    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'About me' }),
      c('p', {
        text: [
          'My name is Ianis Vasilev (pronounce it however you want).',
          'For some reason, I am studying statistics at Sofia University.',
          'According to my contract I am a programmer and according to my ego I am also a musician.',
          'Otherwise I am a relatively sane person.'
        ].join(' ')
      })
    ),

    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'About this website' }),
      c('p', null,
        c('span', { text: 'This website contains random stuff that would otherwise be uploaded to other websites. Since you got here you probably need my ' }),
        c(link, { text: 'file server', link: '/files' }),
        c('span', { text: ' or my ' }),
        c(link, { text: 'pacman repo', link: '/pacman' }),
        c('span', { text: '. Everything here should be pretty self-descriptive.' })
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
