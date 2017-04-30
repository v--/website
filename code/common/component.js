const FortifiedMap = require('common/support/fortified_map');
const { CoolError } = require('common/errors');

const voidTags = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
]);

class ReactiveMap extends FortifiedMap {
    constructor(source) {
        super(source);
        this.listeners = new Set();
    }

    set(key, value) {
        super.set(key, value);

        for (const listener of this.listeners.values())
            listener();
    }
}

class Component {
    constructor(type, options = null, ...contents) {
        this.type = type;

        if (options === null)
            this.options = new ReactiveMap(null);
        else
            this.options = new ReactiveMap(Object.entries(options));

        this.contents = contents.filter(Boolean);
        this.isVoid = voidTags.has(type);

        if (this.isVoid && this.contents.length > 0)
            throw new CoolError('Void tags cannot have contents.');
    }
}

module.exports = function c(...args) {
    return new Component(...args);
};
