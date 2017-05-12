const { h } = require('common/component');
const ServerRenderer = require('server/renderer');

async function render(component) {
    return await new ServerRenderer(component).renderToString();
}

describe('Server-side render', async function () {
    it('Properly renders a br tag', async function () {
        const component = h('br');
        expect(await render(component)).to.equal('<br>');
    });

    it('Properly renders a blank div tag', async function () {
        const component = h('div');
        expect(await render(component)).to.equal('<div></div>');
    });

    it('Properly renders a blank div tag with class and style options', async function () {
        const component = h('div', { class: 'cool', style: 'background: yellow;' });
        expect(await render(component)).to.equal('<div class="cool" style="background: yellow;"></div>');
    });

    it('Properly renders a div tag with a string inside', async function () {
        const component = h('div', null, 'stuff');
        expect(await render(component)).to.equal('<div>stuff</div>');
    });

    it('Properly renders a div with a nested component', async function () {
        const component = h('div', null, h('span', null, 'nested'));
        expect(await render(component)).to.equal('<div><span>nested</span></div>');
    });

    it('Properly renders a div with multiple nested component', async function () {
        const component = h('div', null,
            h('span', null, 'nested1'),
            h('span', null, 'nested2')
        );

        expect(await render(component)).to.equal('<div><span>nested1</span><span>nested2</span></div>');
    });

    it('Properly renders a div with multiple mixed component', async function () {
        const component = h('div', null,
            'nested1',
            h('span', null, 'nested2')
        );

        expect(await render(component)).to.equal('<div>nested1<span>nested2</span></div>');
    });

    it('Can render components', async function () {
        const factory = h(() => h('div'));
        const component = render(factory);
        expect(await component).to.equal('<div></div>');
    });

    it('Allows passing options to components', async function () {
        const factory = ({ options }) => h('div', null, h(options.get('tag')));
        const component = h(factory, { tag: 'span' });
        expect(await render(component)).to.equal('<div><span></span></div>');
    });

    it('Properly transcludes components', async function () {
        const factory = ({ children }) => h('div', null, ...children);
        const component = h(factory, null, h('span'));
        expect(await render(component)).to.equal('<div><span></span></div>');
    });
});
