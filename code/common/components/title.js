const { c } = require('common/component')

module.exports = function title({ title }) {
    return c('title', { text: `${title} | ivasilev.net` })
}
