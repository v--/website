const classlist = require('common/support/classlist')
const { c } = require('common/component')

const icon = require('common/components/icon')

const home = require('common/views/home')
const files = require('common/views/files')
const playground = require('common/views/playground')
const pacman = require('common/views/pacman')

module.exports = function sidebar({ redirect, factory, collapsed, toggleCollapsed }) {
    function entry(state) {
        function click(e) {
            e.preventDefault()
            redirect(state.link)
        }

        const classes = classlist('button', 'entry', state.factory === factory && 'active')

        return c('a', { class: classes, href: state.link, click },
            c(icon, { class: 'entry-icon', name: state.icon }),
            c('span', { class: 'entry-text', text: state.text }),
            c('span', { class: 'entry-icon empty-icon' })
        )
    }

    return c('aside', { class: classlist(collapsed && 'collapsed') },
        c('button', { class: 'entry', click: toggleCollapsed },
            c('span', { class: 'entry-icon empty-icon' }),
            c('span', { class: 'entry-text', text: 'Hide sidebar' }),
            c('span', { class: 'entry-icon empty-icon' })
        ),

        c(entry, {
            text: 'Home page',
            icon: 'home',
            link: '/',
            factory: home
        }),

        c(entry, {
            text: 'File server',
            icon: 'folder',
            link: '/files',
            factory: files
        }),

        c(entry, {
            text: 'Playground',
            icon: 'code-greater-than',
            link: '/playground',
            factory: playground
        }),

        c(entry, {
            text: 'Pacman repo',
            icon: 'download',
            link: '/pacman',
            factory: pacman
        })
    )
}
