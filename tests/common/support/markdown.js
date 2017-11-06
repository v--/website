const { expect } = require('tests')

const markdown = require('common/support/markdown')

function asJSON(text) {
    return markdown(text).toJSON()
}

describe('markdown()', function () {
    it('handles empty strings', function () {
        const src = ''
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: []
        })
    })

    it('handles simple text', function () {
        const src = 'simple text'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'PlainTextNode',
                    text: 'simple text'
                }
            ]
        })
    })

    it('handles multiline text', function () {
        const src = 'multiline\ntext'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'PlainTextNode',
                    text: 'multiline'
                },
                {
                    type: 'NewlineNode'
                },
                {
                    type: 'PlainTextNode',
                    text: 'text'
                }
            ]
        })
    })

    it('handles empty lines', function () {
        const src = 'multiline\n\ntext'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'PlainTextNode',
                    text: 'multiline'
                },
                {
                    type: 'NewlineNode'
                },
                {
                    type: 'NewlineNode'
                },
                {
                    type: 'PlainTextNode',
                    text: 'text'
                }
            ]
        })
    })

    it('handles links', function () {
        const src = '[simple](http://example.com)'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'BracketNode',
                    children: [
                        {
                            text: 'simple',
                            type: 'PlainTextNode'
                        }
                    ]
                },
                {
                    type: 'ParenthesisNode',
                    children: [
                        {
                            type: 'PlainTextNode',
                            text: 'http://example.com'
                        }
                    ]
                }
            ]
        })
    })

    it('handles multiple links', function () {
        const src = '[simple](http://example.com) and [not simple](http://example.com)'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'BracketNode',
                    children: [
                        {
                            text: 'simple',
                            type: 'PlainTextNode'
                        }
                    ]
                },
                {
                    type: 'ParenthesisNode',
                    children: [
                        {
                            type: 'PlainTextNode',
                            text: 'http://example.com'
                        }
                    ]
                },
                {
                    type: 'PlainTextNode',
                    text: ' and '
                },
                {
                    type: 'BracketNode',
                    children: [
                        {
                            text: 'not simple',
                            type: 'PlainTextNode'
                        }
                    ]
                },
                {
                    type: 'ParenthesisNode',
                    children: [
                        {
                            type: 'PlainTextNode',
                            text: 'http://example.com'
                        }
                    ]
                }
            ]
        })
    })

    it('handles code fragments', function () {
        // const src = '`code\nfragment`'
        const src = '`code\nfragment`'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'BacktickNode',
                    text: 'code\nfragment'
                }
            ]
        })
    })

    it('handles complex use cases', function () {
        const src = 'A simple sentence. A `not` so simple sentence.\nOkay, visit [this `link`](http://example.com).'
        expect(asJSON(src)).to.deep.equal({
            type: 'RootNode',
            children: [
                {
                    type: 'PlainTextNode',
                    text: 'A simple sentence. A '
                },
                {
                    type: 'BacktickNode',
                    text: 'not'
                },
                {
                    type: 'PlainTextNode',
                    text: ' so simple sentence.'
                },
                {
                    type: 'NewlineNode'
                },
                {
                    type: 'PlainTextNode',
                    text: 'Okay, visit '
                },
                {
                    type: 'BracketNode',
                    children: [
                        {
                            text: 'this ',
                            type: 'PlainTextNode'
                        },
                        {
                            text: 'link',
                            type: 'BacktickNode'
                        }
                    ]
                },
                {
                    type: 'ParenthesisNode',
                    children: [
                        {
                            type: 'PlainTextNode',
                            text: 'http://example.com'
                        }
                    ]
                },
                {
                    type: 'PlainTextNode',
                    text: '.'
                }
            ]
        })
    })
})
