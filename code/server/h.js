const { Readable } = require('stream');

const StringBuffer = require('common/support/string_buffer');
const { map } = require('common/support/itertools');
const { CoolError } = require('common/errors');
const { voidTags } = require('common/h');

class HStream extends Readable {
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

function *hStringImpl(type, options = null, contents) {
    if (voidTags.has(type) && contents !== undefined)
        throw new CoolError('Void tags cannot have contents');

    yield `<${type}`;

    if (options) {
        for (const [key, value] of Object.entries(options))
            yield ` ${key}="${value}"`;
    }

    yield '>';

    if (voidTags.has(type))
        return;

    if (contents) {
        for (const content of (contents instanceof Array ? contents : [contents]))
            if (content instanceof HStream)
                yield* content;
            else
                yield content;
    }

    yield `</${type}>`;
}

function *hFunctionImpl(type, options = null, contents) {
    yield* type({ h, options, contents });
}

function h(type, options = null, contents) {
    if (type instanceof Function)
        return new HStream(hFunctionImpl(type, options, contents));

    return new HStream(hStringImpl(type, options, contents));
}

module.exports = h;
