const { startsWith } = require('common/support/strtools')
const { c } = require('common/component')

module.exports = function link(state, children) {
    const childState = { href: state.link }

    if (state.click)
        childState.click = state.click

    if (startsWith(state.link, 'http')) // Probably an external link
        childState.target = '_blank'

    if ('text' in state)
        childState.text = state.text
    else if (children.length === 0)
        childState.text = state.link

    childState.link = encodeURI(childState.link)
    return c('a', childState, ...children)
}
