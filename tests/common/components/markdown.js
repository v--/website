const { expect } = require('tests')

const { c } = require('common/component')

const markdown = require('common/components/markdown')
const link = require('common/components/link')

describe('markdown component', function () {
    it('handles empty strings', function () {
        const src = c(markdown, { text: '' })
        const dest = c('p', { class: 'markdown' })
        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles simple text', function () {
        const src = c(markdown, { text: 'simple text' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: 'simple text' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles multiline text', function () {
        const src = c(markdown, { text: 'simple\ntext' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: 'simple' }),
            c('br'),
            c('span', { text: 'text' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles empty lines', function () {
        const src = c(markdown, { text: 'simple\n\ntext' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: 'simple' }),
            c('br'),
            c('br'),
            c('span', { text: 'text' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles links', function () {
        const src = c(markdown, { text: '[simple](http://example.com)' })
        const dest = c('p', { class: 'markdown' },
            c(link, { text: 'simple', link: 'http://example.com' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('treats unfinished links as regular text', function () {
        const src = c(markdown, { text: '[simple](http://example.com' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: '[simple](http://example.com' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('treats square brackets without following parenthesis as text', function () {
        const src = c(markdown, { text: '[simple]' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: '[simple]' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('treats following parenthesis without preceding square brackets as text', function () {
        const src = c(markdown, { text: '(http://example.com)' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: '(http://example.com)' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles multiple links', function () {
        const src = c(markdown, { text: '[simple](http://example.com) and [not simple](http://example.com)' })
        const dest = c('p', { class: 'markdown' },
            c(link, { text: 'simple', link: 'http://example.com' }),
            c('span', { text: ' and ' }),
            c(link, { text: 'not simple', link: 'http://example.com' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles code fragments', function () {
        const src = c(markdown, { text: '`code`' })
        const dest = c('p', { class: 'markdown' },
            c('code', { text: 'code' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })

    it('handles complex use cases', function () {
        const src = c(markdown, { text: 'A simple sentence. A `not` so simple sentence.\nOkay, visit [this](http://example.com) `link`.' })
        const dest = c('p', { class: 'markdown' },
            c('span', { text: 'A simple sentence. A ' }),
            c('code', { text: 'not' }),
            c('span', { text: ' so simple sentence.' }),
            c('br'),
            c('span', { text: 'Okay, visit ' }),
            c(link, { text: 'this', link: 'http://example.com' }),
            c('span', { text: ' ' }),
            c('code', { text: 'link' }),
            c('span', { text: '.' })
        )

        expect(src.evaluate()).to.equalComponent(dest)
    })
})
