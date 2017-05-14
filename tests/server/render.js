const { f, h } = require('common/component');
const render = require('server/render');

function renderToString(component) {
    return Array.from(render(component)).join('');
}

describe('Server-side render', function () {
    it('Properly renders a br tag', function () {
        const component = h('br');
        expect(renderToString(component)).to.equal('<br>');
    });

    it('Properly renders a blank div tag', function () {
        const component = h('div');
        expect(renderToString(component)).to.equal('<div></div>');
    });

    it('Properly renders a blank div tag with class and style options', function () {
        const component = h('div', { class: 'cool', style: 'background: yellow;' });
        expect(renderToString(component)).to.equal('<div class="cool" style="background: yellow;"></div>');
    });

    it('Properly renders a div tag with a string inside', function () {
        const component = h('div', null, 'stuff');
        expect(renderToString(component)).to.equal('<div>stuff</div>');
    });

    it('Properly renders a div with a nested component', function () {
        const component = h('div', null, h('span', null, 'nested'));
        expect(renderToString(component)).to.equal('<div><span>nested</span></div>');
    });

    it('Properly render a div with multiple nested component', function () {
        const component = h('div', null,
            h('span', null, 'nested1'),
            h('span', null, 'nested2')
        );

        expect(renderToString(component)).to.equal('<div><span>nested1</span><span>nested2</span></div>');
    });

    it('Properly render a div with multiple mixed component', function () {
        const component = h('div', null,
            'nested1',
            h('span', null, 'nested2')
        );

        expect(renderToString(component)).to.equal('<div>nested1<span>nested2</span></div>');
    });

    it('Can render components', function () {
        const factory = f(() => h('div'));
        const component = renderToString(factory);
        expect(component).to.equal('<div></div>');
    });

    it('Allows passing options to components', function () {
        const factory = ({ options }) => h('div', null, h(options.get('tag')));
        const component = f(factory, { tag: 'span' });
        expect(renderToString(component)).to.equal('<div><span></span></div>');
    });

    it('Properly transcludes components', function () {
        const factory = ({ children }) => h('div', null, ...children);
        const component = f(factory, null, h('span'));
        expect(renderToString(component)).to.equal('<div><span></span></div>');
    });
});
