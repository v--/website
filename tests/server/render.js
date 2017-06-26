const { describe, it, expect } = require('tests')

const c = require('framework/c')
const render = require('server/render')

function renderToString(component) {
    return Array.from(render(component)).join('')
}

describe('Server-side render', function () {
    it('Properly renders a br tag', function () {
        const component = c('br')
        expect(renderToString(component)).to.equal('<br>')
    })

    it('Properly renders a blank div tag', function () {
        const component = c('div')
        expect(renderToString(component)).to.equal('<div></div>')
    })

    it('Properly renders a blank div tag with class and style options', function () {
        const component = c('div', { class: 'cool', style: 'background: yellow;' })
        expect(renderToString(component)).to.equal('<div class="cool" style="background: yellow;"></div>')
    })

    it('Properly renders a div tag with a string inside', function () {
        const component = c('div', null, 'stuff')
        expect(renderToString(component)).to.equal('<div>stuff</div>')
    })

    it('Properly renders a div with a nested component', function () {
        const component = c('div', null, c('span', null, 'nested'))
        expect(renderToString(component)).to.equal('<div><span>nested</span></div>')
    })

    it('Properly render a div with multiple nested component', function () {
        const component = c('div', null,
            c('span', null, 'nested1'),
            c('span', null, 'nested2')
        )

        expect(renderToString(component)).to.equal('<div><span>nested1</span><span>nested2</span></div>')
    })

    it('Properly render a div with multiple mixed component', function () {
        const component = c('div', null,
            'nested1',
            c('span', null, 'nested2')
        )

        expect(renderToString(component)).to.equal('<div>nested1<span>nested2</span></div>')
    })

    it('Can render components', function () {
        const factory = c(() => c('div'))
        const component = renderToString(factory)
        expect(component).to.equal('<div></div>')
    })

    it('Allows passing options to components', function () {
        const factory = ({ options }) => c('div', null, c(options.get('tag')))
        const component = c(factory, { tag: 'span' })
        expect(renderToString(component)).to.equal('<div><span></span></div>')
    })

    it('Properly transcludes components', function () {
        const factory = ({ children }) => c('div', null, ...children)
        const component = c(factory, null, c('span'))
        expect(renderToString(component)).to.equal('<div><span></span></div>')
    })
})
