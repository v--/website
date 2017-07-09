const { c } = require('common/component')

module.exports = function title(state) {
    return c('title', { text: `${state.title} | ivasilev.net` })
}
