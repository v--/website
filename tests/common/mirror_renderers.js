const { expect } = require('tests')

const { render } = require('common/mirror_renderers')
const { c } = require('common/component')

describe('MirrorXMLRenderer', function () {
    describe('.render', function () {
        it('renders simple components', function () {
            const src = c('div')
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })

        it('renders components with state', function () {
            const src = c('div', { a: 0 })
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })

        it('renders components with text children', function () {
            const src = c('div', { text: 'text'})
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })

        it('renders components with HTML children', function () {
            const src = c('div', null, c('span'), c('span', { text: 'text' }))
            const dest = render(src)

            expect(src).to.equalComponent(dest)
        })
    })
})

describe('MirrorFactoryRenderer', function () {
    describe('.render', function () {
        it('renders constants', function () {
            const constant = render(c('div'))
            const src = c(() => constant)
            const dest = render(src)

            expect(dest).to.equalComponent(constant)
        })

        it('renders simple text', function () {
            const src = c(({ text }) => c('span', { text }), { text: 'text' })
            const dest = render(src)

            expect(dest.state.text).to.equal('text')
        })
    })
})
