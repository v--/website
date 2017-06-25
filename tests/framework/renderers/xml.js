const { describe, it, expect } = require('tests');
const render = require('framework/renderers/mirror/render');

const ReactiveMap = require('common/support/reactive_map');
const c = require('framework/c');

describe('MirrorXMLRenderer', function () {
    describe('.render', function () {
        it('renders simple components', function () {
            const src = c('div');
            const dest = render(src);

            expect(src.equals(dest)).to.be.true;
        });

        it('renders components with options', function () {
            const src = c('div', { a: 0 });
            const dest = render(src);

            expect(src.equals(dest)).to.be.true;
        });

        it('renders components with text children', function () {
            const src = c('div', null, 'text');
            const dest = render(src);

            expect(src.equals(dest)).to.be.true;
        });

        it('renders components with HTML children', function () {
            const src = c('div', null, c('span'), 'text');
            const dest = render(src);

            expect(src.equals(dest)).to.be.true;
        });
    });

    describe('.rerender', function () {
        it('adds new properties', function () {
            const options = new ReactiveMap();
            const src = c('div', options);
            const dest = render(src);

            options.set('text', 'a');
            expect(dest.options.get('text')).to.equal('a');
        });

        it('removes existing properties', function () {
            const options = ReactiveMap.fromObject({ text: 'a' });
            const src = c('div', options);
            const dest = render(src);

            options.delete('text');
            expect(dest.options.has('text')).to.be.false;
        });

        it('changes properties', function () {
            const options = ReactiveMap.fromObject({ text: 'a' });
            const src = c('div', options);
            const dest = render(src);

            options.set('text', 'b');

            expect(dest.options.get('text')).to.equal('b');
        });
    });
});
