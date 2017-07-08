const { c } = require('common/component')

module.exports = function section({ title }, children) {
    return c('div', { class: 'section' },
        c('h1', { text: title }),
        ...children
    )
}
