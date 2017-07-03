const { c } = require('common/component')

function main(parsedURL, [child]) {
    return c('main', null, child)
}

function sidebar({ route }) {
    return c('aside', null,
        c('h1', { text: route })
    )
}

module.exports = function body(parsedURL, [child]) {
    return c('body', null,
        c(sidebar, parsedURL),
        c(main, parsedURL, child)
    )
}
