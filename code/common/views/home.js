const { c } = require('common/component')

const icon = require('common/components/icon')

module.exports = {
    fetchData() {
        return null
    },

    component() {
        return c('div', null,
            c('h1', { text: 'stuff' }),
            c(icon)
        )
    }
}
