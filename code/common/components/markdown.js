// TODO: Find Jesus (and a better way to implement the parser)

const { CoolError } = require('common/errors')
const { startsWith } = require('common/support/strings')
const { c } = require('common/component')

const link = require('common/components/link')

class MarkdownError extends CoolError {}

class Buffer {
    constructor(type) {
        this.type = type
        this.payload = []
        this.sealed = false
    }

    push(char) {
        if (this.sealed)
            throw new MarkdownError(`Unexpected character ${char}`)

        this.payload.push(char)
    }

    get value() {
        return this.payload.join('')
    }

    get isEmpty() {
        return this.payload.length === 0
    }

    seal() {
        this.sealed = true
    }
}

module.exports = function markdown({ text, urlHandler }) {
    const buffers = [new Buffer('text')]

    Object.defineProperty(buffers, 'current', {
        get() {
            if (this.length === 0)
                throw new MarkdownError('Buffer underflow')

            return this[this.length - 1]
        }
    })

    const result = c('p', { class: 'markdown' })

    for (const char of text)
        switch (char) {
        case '\n': {
            if (buffers.current.type !== 'text')
                break

            if (buffers.current.isEmpty) {
                result.children.push(c('br'))
            } else {
                result.children.push(
                    c('span', { text: buffers.pop().value }),
                    c('br'),
                )

                buffers.push(new Buffer('text'))
            }

            break
        }

        case '`': {
            if (buffers.current.type === 'code') {
                result.children.push(
                    c('code', { text: buffers.pop().value })
                )

                buffers.push(new Buffer('text'))
            } else {
                if (buffers.current.type === 'text' && buffers.current.value)
                    result.children.push(
                        c('span', { text: buffers.pop().value })
                    )

                buffers.push(new Buffer('code'))
            }

            break
        }

        case '[': {
            if (buffers.current.type === 'text' && buffers.current.value)
                result.children.push(
                    c('span', { text: buffers.pop().value })
                )

            buffers.push(new Buffer('square'))
            break
        }

        case ']': {
            if (buffers.current.type === 'square')
                buffers.current.seal()
            else
                buffers.current.push(char)
            break
        }

        case '(': {
            if (buffers.current.type === 'text' && buffers.current.value)
                result.children.push(
                    c('span', { text: buffers.pop().value })
                )

            buffers.push(new Buffer('round'))
            break
        }

        case ')': {
            const current = buffers.pop()
            const last = buffers.pop()

            if (current && current.type === 'round') {
                if (last && last.type === 'square') {
                    const label = last.value
                    const url = current.value

                    const context = { text: label, link: url }

                    if (urlHandler)
                        context.click = function (e) {
                            e.preventDefault()
                            urlHandler(url)
                        }

                    context.internal = !startsWith(url, 'http')

                    result.children.push(
                        c(link, context)
                    )

                    buffers.push(new Buffer('text'))
                } else {
                    const value = '(' + current.value + ')'

                    if (last && last.type === 'text') {
                        last.push(value)

                        if (last)
                            buffers.push(last)
                    } else {
                        if (last)
                            buffers.push(last)

                        buffers.push(new Buffer('text'))
                        buffers.current.push(value)
                    }
                }
            } else {
                current.push(char)
                buffers.push(last)
                buffers.push(current)
            }

            break
        }

        default: {
            buffers.current.push(char)
            break
        }
        }

    let remainingText = ''

    while (buffers.length > 0) {
        const buffer = buffers.shift()

        switch (buffer.type) {
        case 'square':
            remainingText += '[' + buffer.value

            if (buffer.sealed)
                remainingText += ']'

            break

        case 'round':
            remainingText += '(' + buffer.value

            if (buffer.sealed)
                remainingText += ')'

            break

        case 'text':
            remainingText += buffer.value

            if (remainingText)
                result.children.push(
                    c('span', { text: remainingText })
                )

            remainingText = ''
        }
    }

    if (remainingText)
        if (remainingText)
            result.children.push(
                c('span', { text: remainingText })
            )

    return result
}
