const h = require('server/h');

function render(...args) {
    return Array.from(h(...args)).join('');
}

describe('Server-side h', function() {
    it('Properly renders a br tag', function() {
        const rendered = render('br');
        expect(rendered).to.equal('<br>');
    });

    it('Properly renders a blank div tag', function() {
        const rendered = render('div');
        expect(rendered).to.equal('<div></div>');
    });

    it('Properly renders a blank div tag with class and style options', function() {
        const rendered = render('div', { class: 'cool', style: 'background: yellow;' });
        expect(rendered).to.equal('<div class="cool" style="background: yellow;"></div>');
    });

    it('Properly renders a div tag with a string inside', function() {
        const rendered = render('div', null, 'stuff');
        expect(rendered).to.equal('<div>stuff</div>');
    });

    it('Properly renders a div with a nested component', function() {
        const rendered = render('div', null, h('span', null, 'nested'));
        expect(rendered).to.equal('<div><span>nested</span></div>');
    });

    it('Properly renders a div with multiple nested component', function() {
        const rendered = render('div', null,
            h('span', null, 'nested1'),
            h('span', null, 'nested2')
        );

        expect(rendered).to.equal('<div><span>nested1</span><span>nested2</span></div>');
    });

    it('Properly renders a div with multiple mixed component', function() {
        const rendered = render('div', null,
            'nested1',
            h('span', null, 'nested2')
        );

        expect(rendered).to.equal('<div>nested1<span>nested2</span></div>');
    });

    it('Can render components', function() {
        const component = ({ h }) => h('div');
        const rendered = render(component);
        expect(rendered).to.equal('<div></div>');
    });

    it('Allows passing options to components', function() {
        const component = ({ h, options }) => h('div', null, h(options.tag));
        const rendered = render(component, { tag: 'span' });
        expect(rendered).to.equal('<div><span></span></div>');
    });

    it('Properly transcludes components', function() {
        const component = ({ h, contents }) => h('div', null, ...contents);
        const rendered = render(component, null, h('span'));
        expect(rendered).to.equal('<div><span></span></div>');
    });
});
