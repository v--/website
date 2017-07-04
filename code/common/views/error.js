const { c } = require('common/component')
const section = require('common/components/section')
const text = require('common/components/text')

module.exports = function playground() {
    return c('main', { class: 'error-page' },
        c(section, { title: '/error' },
            c(text, {
                text: 'uhmmm'
            })
        )
    )
}
