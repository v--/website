const { c } = require('common/component')

const sidebar = require('common/components/sidebar')
const sidebarToggle = require('common/components/sidebar_toggle')

module.exports = function body(state) {
    return c('main', null,
        c(sidebarToggle, state),
        c(sidebar, state),
        c(state.factory, state)
    )
}
