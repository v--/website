const { c } = require('common/component')
const section = require('common/components/section')
const markdown = require('common/components/markdown')

module.exports = function playground() {
    return c('div', { class: 'page playground-page' },
        c(section, { title: '/playground' },
            c(markdown, {
                text: 'uhmmm'
            })
        )
    )
}
