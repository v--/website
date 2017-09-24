const { startsWith } = require('common/support/strings')
const classlist = require('common/support/classlist')
const { c } = require('common/component')

const icon = require('common/components/icon')
const link = require('common/components/link')

module.exports = function sidebar({ id, isCollapsed, toggleCollapsed }) {
    function entry(state) {
        const classes = classlist('button', 'entry', startsWith(id, state.id) && 'active')

        return c(link, { class: classes, link: state.link, isInternal: true },
            c(icon, { class: 'entry-icon', name: state.icon }),
            c('span', { class: 'entry-text', text: state.text })
        )
    }

    return c('aside', { class: classlist('sidebar', isCollapsed && 'collapsed') },
        c('button', { class: 'entry', click: toggleCollapsed, disabled: toggleCollapsed === undefined },
            c(icon, { class: 'entry-icon', name: 'chevron-left' }),
            c('span', { class: 'entry-text', text: 'Hide sidebar' })
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
            id: 'pacman',
            text: 'Pacman repo',
            icon: 'download',
            link: '/pacman'
        }),

        c(entry, {
            id: 'playground',
            text: 'Playground',
            icon: 'code-greater-than',
            link: '/playground'
        })
    )
}
