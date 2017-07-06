const link = require('common/components/link')
const { c } = require('common/component')

module.exports = function text({ text, urlHandler }) {
    const re = /\[(.+?)\]\((.+?)\)|`(.+?)`/g
    const children = []
    let last = 0

    for (let match = re.exec(text); match; match = re.exec(text)) {
        const [all, content, url, code] = match
        children.push(c('span', { text: text.substring(last, match.index) }))

        if (code) {
            children.push(c('code', { text: code }))
        } else {
            const context = { text: content, link: url }

            if (urlHandler)
                context.click = function (e) {
                    e.preventDefault()
                    urlHandler(url)
                }

            children.push(c(link, context))
        }

        last = match.index + all.length
    }

    children.push(c('span', { text: text.substring(last) }))
    return c('p', null, ...children)
}
