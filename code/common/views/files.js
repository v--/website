const { c } = require('common/component')
const section = require('common/components/section')
const text = require('common/components/text')

module.exports = function files() {
    return c('div', { class: 'page files-page' },
        c(section, { title: '/files' },
            c(text, {
                text: 'uhmmm'
            })
        )
    )
}
