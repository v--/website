const link = require('common/components/link')
const { c } = require('common/component')

module.exports = function text({ text: fullText }) {
    const re = /\[(.+?)\]\((.+?)\)|`(.+?)`/g
    const children = []
    let last = 0

    for (let match = re.exec(fullText); match; match = re.exec(fullText)) {
        const [, text, href, code] = match

        children.push(c('span', { text: fullText.substring(last, match.index) }))

        if (code)
            children.push(c('code', { text: code }))
        else
            children.push(c(link, { text: text, href: href }))

        last = match.index + match[0].length
    }

    children.push(c('span', { text: fullText.substring(last) }))
    return c('p', null, ...children)
}
