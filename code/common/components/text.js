const link = require('common/components/link')
const { c } = require('common/component')

module.exports = function text({ text }) {
    const re = /\[(.+?)\]\((.+?)\)/g
    const children = []
    let last = 0

    for (let match = re.exec(text); match; match = re.exec(text)) {
        children.push(c('span', { text: text.substring(last, match.index) }))
        children.push(c(link, { text: match[1], href: match[2] }))
        last = match.index + match[0].length
    }

    children.push(c('span', { text: text.substring(last) }))
    return c('p', null, ...children)
}
