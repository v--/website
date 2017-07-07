const { c } = require('common/component')

const icon = require('common/components/icon')

module.exports = function sidebarToggle({ isCollapsed, toggleCollapsed }) {
    return c('div', { class: 'sidebar-toggle button' },
        c(icon, {
            name: 'chevron-left',
            class: isCollapsed && 'collapsed',
            click: toggleCollapsed
        })
    )
}
