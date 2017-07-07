const { c } = require('common/component')
const { map } = require('common/support/itertools')

const section = require('common/components/section')

function file({ type, name }) {
    return c('tr', null,
        c('td', { text: name }),
        c('td', { text: type })
    )
}

module.exports = function files({ data }) {
    return c('div', { class: 'page files-page' },
        c(section, { title: '/files' },
            c('table', null,
                c('thead', null,
                    c('tr', null,
                        c('th', { text: 'Name' }),
                        c('th', { text: 'Type' })
                    )
                ),

                c('tbody', null, ...map(file, data))
            )
        )
    )
}
