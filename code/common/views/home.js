const { c } = require('common/component')
const section = require('common/components/section')
const text = require('common/components/text')
const icon = require('common/components/icon')
const link = require('common/components/link')

function contact({ text, icon: name, href }) {
    return c('li', { class: 'contact' },
        c(link, { href },
            c(icon, { name }),
            c('span', { text })
        )
    )
}

module.exports = function home() {
    return c('div', { class: 'page home-page' },
        c(section, { title: 'Welcome!' },
            c(text, {
                text: 'This is my personal website - nothing more.'
            }),
        ),

        c(section, { title: 'About me' },
            c(text, {
                text: [
                    'My name is Ianis Vasilev (pronounce it however you want).',
                    'For some reason, I am studying statistics at Sofia University.',
                    'According to my contract I am a programmer and according to my ego I am also a musician.',
                    'Otherwise I am a relatively sane person.'
                ].join(' ')
            }),
        ),

        c(section, { title: 'About this website' },
            c(text, {
                text: [
                    'This website contains random stuff that would otherwise be uploaded to other websites.',
                    'Since you got here you probably need my [file server](/files) or my [pacman repo](/pacman).',
                    'I also have a [web playground](/playground).',
                    'Everything here should be pretty self-descriptive.'
                ].join(' ')
            })
        ),

        c(section, { title: 'Contacts' },
            c('ul', null,
                c(contact, {
                    text: 'Email',
                    icon: 'email',
                    href: 'mailto:ianis@ivasilev.net'
                }),

                c(contact, {
                    text: 'GitHub',
                    icon: 'github',
                    href: 'https://github.com/v--'
                }),

                c(contact, {
                    text: 'Facebook',
                    icon: 'facebook',
                    href: 'https://www.facebook.com/ianis.vasilev'
                })
            )
        )
    )
}
