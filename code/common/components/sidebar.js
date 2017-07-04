const classlist = require('common/support/classlist')
const { c } = require('common/component')

const icon = require('common/components/icon')

module.exports = function sidebar({ id, redirect, collapsed, toggleCollapsed }) {
    function entry(state) {
        function click(e) {
            e.preventDefault()
            redirect(state.link)
        }

        const classes = classlist('button', 'entry', state.id === id && 'active')

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
            id: 'home',
            text: 'Home page',
            icon: 'home',
            link: '/'
        }),

        c(entry, {
            id: 'files',
            text: 'File server',
            icon: 'folder',
            link: '/files'
        }),

        c(entry, {
            id: 'playground',
            text: 'Playground',
            icon: 'code-greater-than',
            link: '/playground'
        }),

        c(entry, {
            id: 'pacman',
            text: 'Pacman repo',
            icon: 'download',
            link: '/pacman'
        })
    )
}
