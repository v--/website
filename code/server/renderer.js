const { Readable } = require('stream');

const StringBuffer = require('common/support/string_buffer');
const Renderer = require('common/renderer');
const { map } = require('common/support/itertools');

const fs = require('server/support/fs');

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
    get db() {
        return {
            async getIcons() {
                return JSON.parse(await fs.readFile('public/icons.json'));
            }
        };
    }

    *renderComponentImpl(renderedChildren) {
        yield `<${this.component.type}`;

        for (const [key, value] of this.component.options)
            if (!(value instanceof Function))
                yield ` ${key}="${value}"`;

        yield '>';

        if (this.component.isVoid)
            return;

        for (const child of renderedChildren)
            if (typeof child === 'string')
                yield child;
            else
                yield* child;

        yield `</${this.component.type}>`;
    }

    async renderComponent() {
        const renderingChildren = this.component.children.map(child => {
            if (typeof child === 'string')
                return child;

            return new this.constructor(child).render();
        });

        return this.renderComponentImpl(await Promise.all(renderingChildren));
    }

    async renderToStream() {
        return new RenderStream(await this.render());
    }

    async renderToString() {
        return Array.from(await this.render()).join('');
    }
};
