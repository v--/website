const { c } = require('common/component')

module.exports = function nojs() {
    return c('noscript', {
        class: 'nojs',
        text: 'A modern JavaScript interpreter is required for interactive content and smooth navigation'
    })
}
