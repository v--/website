const { c } = require('common/component')
const markdownParser = require('common/support/markdown')
const link = require('common/components/link')

const { RootNode, NewlineNode, PlainTextNode, BacktickNode, ParenthesisNode, BracketNode, NonLeafNode, AsteriskNode } = markdownParser

function buildLink(visibleNode, urlNode, urlHandler) {
    const url = urlNode.children.map(String).join('')
    const context = { link: url }
    context.isInternal = !/^https?:\/\//.test(url)

    if (urlHandler)
        context.click = function () {
            urlHandler(url)
        }

    return c(link, context, ...buildComponentTree(visibleNode).children.slice(1, -1))
}

function buildComponentTree(node, urlHandler) {
    if (node instanceof NewlineNode)
        return c('br')

    if (node instanceof PlainTextNode)
        return c('span', { text: node.text })

    if (node instanceof BacktickNode)
        if (~node.text.indexOf('\n'))
            return c('pre', null,
              c('code', { text: node.text })
            )
        else
            return c('code', { text: node.text })

    if (node instanceof NonLeafNode) {
        const result = node instanceof RootNode ? c('p', { class: 'markdown' }) : node instanceof AsteriskNode ? c('b') : c('span')

        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]

            if (child instanceof AsteriskNode) {
                result.children.push(buildComponentTree(child))
            } else if (child instanceof BracketNode && node.children[i + 1] instanceof ParenthesisNode) {
                result.children.push(buildLink(child, node.children[++i], urlHandler))
            } else {
                const tree = buildComponentTree(child)

                if (node instanceof ParenthesisNode)
                    result.children.push(c('span', { text: '(' }))
                else if (node instanceof BracketNode)
                    result.children.push(c('span', { text: '[' }))

                result.children.push(tree)

                if (node instanceof ParenthesisNode)
                    result.children.push(c('span', { text: ')' }))
                else if (node instanceof BracketNode)
                    result.children.push(c('span', { text: ']' }))
            }
        }

        return result
    }
}

module.exports = function markdown({ text, urlHandler }) {
    const tree = markdownParser(text)
    return buildComponentTree(tree, urlHandler)
}
