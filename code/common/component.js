const FortifiedMap = require('common/support/fortified_map');
const { CoolError, NotImplementedError } = require('common/errors');

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
    get namespace() {
        throw new NotImplementedError();
    }

    constructor(type, options = null, ...children) {
        this.type = type;

        if (options === null)
            this.options = new ReactiveMap(null);
        else
            this.options = new ReactiveMap(Object.entries(options));

        this.children = children.filter(Boolean);
        this.isVoid = voidTags.has(type);

        if (this.isVoid && this.children.length > 0)
            throw new CoolError('Void tags cannot have children.');
    }
}

class HTMLComponent extends Component {
    get namespace() {
        return 'http://www.w3.org/1999/xhtml';
    }
}

class SVGComponent extends Component {
    get namespace() {
        return 'http://www.w3.org/2000/svg';
    }
}

function html(...args) {
    return new HTMLComponent(...args);
}

function svg(...args) {
    return new SVGComponent(...args);
}

module.exports = {
    Component,
    HTMLComponent,
    SVGComponent,
    html,
    svg,
    h: html
};
