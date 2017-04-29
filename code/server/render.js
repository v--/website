const { Readable } = require('stream');

const StringBuffer = require('common/support/string_buffer');
const c = require('common/component');
const { map } = require('common/support/itertools');

class RenderStream extends Readable {
    constructor(iter) {
        super();
        this.size = 0;
        this.buffered = new StringBuffer(map(String, iter));
    }

    _read(maxSize) {
        if (this.buffered.exhausted)
            return;

        try {
            const read = this.buffered.read(maxSize);
            this.size += read.length;
            this.push(read);

            if (this.buffered.exhausted) {
                this.emit('size', this.size);
                this.push(null);
            }
        } catch (e) {
            this.emit('error', e);
        }
    }

    *iterate() {
        while (!this.buffered.exhausted)
            yield this.buffered.read(100);
    }

    [Symbol.iterator]() {
        return this.iterate();
    }
}

function* renderComponent(component) {
    yield `<${component.type}`;

    for (const [key, value] of component.options.entries())
        yield ` ${key}="${value}"`;

    yield '>';

    if (component.isVoid)
        return;

    for (const content of component.contents)
        if (typeof content === 'string')
            yield content;
        else
            yield* renderImpl(content);

    yield `</${component.type}>`;
}

function renderFactory(component) {
    return renderImpl(component.type({
        options: component.options,
        contents: component.contents
    }));
}

function renderImpl(component) {
    if (component instanceof Function)
        return renderImpl(c(component));

    if (component.type instanceof Function)
        return renderFactory(component);

    return renderComponent(component);
}

module.exports = function render(component) {
    return new RenderStream(renderImpl(component));
};
