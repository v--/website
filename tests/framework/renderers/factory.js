const { describe, it, expect } = require('tests')

const TextComponent = require('framework/components/text')
const render = require('framework/renderers/mirror/render')
const c = require('framework/c')

describe('MirrorXMLRenderer', function () {
    describe('.render', function () {
        it('renders constants', function () {
            const constant = render(c('div'))
            const src = c(() => constant)
            const dest = render(src)

            expect(dest.equals(constant)).to.be.true
        })

        it('renders simple text', function () {
            const src = c(({ options }) => new TextComponent(options.get('text')), { text: 'text' })
            const dest = render(src)

            expect(dest.text).to.equal('text')
        })

        it('renders nested factories', function () {
            const constant = render(c('div'))
            const src = c(() => c(() => constant))
            const dest = render(src)

            expect(dest.equals(constant)).to.be.true
        })
    })

    describe('.rerender', function () {
    })
})
