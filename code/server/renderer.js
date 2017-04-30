const { Readable } = require('stream');

const StringBuffer = require('common/support/string_buffer');
const Renderer = require('common/renderer');
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
}

module.exports = class ServerRenderer extends Renderer {
    *renderComponent() {
        yield `<${this.component.type}`;

        for (const [key, value] of this.component.options)
            yield ` ${key}="${value}"`;

        yield '>';

        if (this.component.isVoid)
            return;

        for (const content of this.component.contents)
            if (typeof content === 'string')
                yield content;
            else
                yield* new this.constructor(content).render();

        yield `</${this.component.type}>`;
    }

    renderToStream() {
        return new RenderStream(this.render());
    }

    renderToString() {
        return Array.from(this.render()).join('');
    }
};
