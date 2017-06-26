const c = require('framework/c')

const icon = require('common/components/icon')

module.exports = {
    fetchData() {
        return null
    },

    component() {
        return c('div', null,
            c('h1', null, 'stuff'),
            c(icon)
        )
    }
}
