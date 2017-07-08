const { c } = require('common/component')
const classlist = require('common/support/classlist')

const icon = require('common/components/icon')

module.exports = function sidebarToggle({ isCollapsed, toggleCollapsed }) {
    return c(icon, {
        name: 'chevron-left',
        class: classlist('sidebar-toggle', isCollapsed && 'collapsed'),
        click: toggleCollapsed
    })
}
