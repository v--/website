const { c } = require('common/component')
const { Observable } = require('common/support/observation')

const sidebar = require('common/components/sidebar')

module.exports = function body(state) {
    const sidebarState = new Observable({
        redirect: state.redirect,
        factory: state.factory,
        collapsed: false,
        toggleCollapsed() {
            sidebarState.update({ collapsed: !sidebarState.current.collapsed })
        }
    })

    return c('body', null,
        c(sidebar, sidebarState),
        c(state.factory, state)
    )
}
