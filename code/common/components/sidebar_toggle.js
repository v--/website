const classlist = require('common/support/classlist')
const { c } = require('common/component')

const icon = require('common/components/icon')

module.exports = function sidebar({ isCollapsed, toggleCollapsed }) {
    return c(icon, {
        name: 'chevron-left',
        class: classlist('sidebar-toggle', isCollapsed && 'collapsed'),
        click: toggleCollapsed
    })
}
