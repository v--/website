const Interface = require('common/support/interface')
const { filter } = require('common/support/objecttools')
const { c } = require('common/component')

module.exports = function link({ text, href, style, class: cls }, children) {
    const state = filter({ text, href, style, class: cls, target: '_blank' })

    if (children.length === 0 && text instanceof Interface.IUndefined)
        state.text = href

    return c('a', state, ...children)
}
