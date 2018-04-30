import { c } from '../component'

import section from '../components/section'
import markdown from '../components/markdown'
import icon from '../components/icon'
import link from '../components/link'

function contact (state) {
  return c('li', { class: 'contact' },
    c(link, { link: state.link },
      c(icon, { name: state.icon }),
      c('span', { text: state.text })
    )
  )
}

export default function home ({ redirect }) {
  return c('div', { class: 'page home-page' },
    c(section, { title: 'Welcome!' },
      c(markdown, {
        text: 'This is my personal website - nothing more.'
      })
    ),

    c(section, { title: 'About me' },
      c(markdown, {
        text: [
          'My name is Ianis Vasilev (pronounce it however you want).',
          'For some reason, I am studying statistics at Sofia University.',
          'According to my contract I am a programmer and according to my ego I am also a musician.',
          'Otherwise I am a relatively sane person.'
        ].join(' ')
      })
    ),

    c(section, { title: 'About this website' },
      c(markdown, {
        urlHandler: redirect,
        text: [
          'This website contains random stuff that would otherwise be uploaded to other websites.',
          'Since you got here you probably need my [file server](/files) or my [pacman repo](/pacman).',
          'Everything here should be pretty self-descriptive.'
        ].join(' ')
      })
    ),

    c(section, { title: 'Contacts' },
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
