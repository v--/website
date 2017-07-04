const { c } = require('common/component')
const section = require('common/components/section')
const text = require('common/components/text')

module.exports = function files() {
    return c('main', { class: 'files-page' },
        c(section, { title: '/files' },
            c(text, {
                text: 'uhmmm'
            })
        )
    )
}
