const { c } = require('common/component')

module.exports = function link(state, children) {
    const childState = Object.assign({ target: '_blank', href: state.link }, state)
    delete childState.link

    if (children.length === 0 && !('text' in state))
        childState.text = state.link

    return c('a', childState, ...children)
}
