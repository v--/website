const { describe, it, expect } = require('tests');

const TextComponent = require('framework/components/text');
const MirrorTextRenderer = require('framework/renderers/mirror/text');

describe('MirrorTextRenderer', function () {
    describe('.render', function () {
        it('renders a text component', function () {
            const src = new TextComponent('text');
            const renderer = new MirrorTextRenderer(src);
            const dest = renderer.render();

            expect(dest.text).to.equal('text');
        });
    });

    describe('.rerender', function () {
        it('rerenders a text component', function () {
            const src = new TextComponent('text');
            const renderer = new MirrorTextRenderer(src);
            const dest = renderer.render();

            src.text = 'updated text';

            // The text renderer never triggers it's own rerender logic
            renderer.rerender();
            expect(dest.text).to.equal('updated text');
        });
    });
});
