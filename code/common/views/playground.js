const { c } = require('common/component')
const section = require('common/components/section')
const text = require('common/components/text')

module.exports = function playground() {
    return c('div', { class: 'page playground-page' },
        c(section, { title: '/playground' },
            c(text, {
                text: 'uhmmm'
            })
        )
    )
}
