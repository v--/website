const ReactiveMap = require('common/support/reactive_map');
const { empty } = require('common/support/itertools');
const { CoolError, NotImplementedError } = require('common/errors');

const htmlVoidTags = new Set([
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

class Component {
    static factory(type, options = null, ...children) {
        const optionIterator = options === null ? empty() : Object.entries(options);
        return new this(type, new ReactiveMap(optionIterator), children.filter(Boolean));
    }

    constructor(type, options, children) {
        this.type = type;
        this.options = options;
        this.children = children;
    }

    equals(other) {
        return this.type === other.type &&
            this.options.equals(other.options) &&
            this.children.length === other.children.length &&
            this.children.every((value, i) => other[i] === value);
    }

    dup() {
        return new this.constructor(this.type, this.options.dup(), Array.from(this.children));
    }
}

class FactoryComponent extends Component {
    evaluate() {
        return this.type({
            options: this.options,
            children: this.children
        });
    }
}

class XMLComponent extends Component {
    get namespace() {
        throw new NotImplementedError();
    }
}

class HTMLComponent extends XMLComponent {
    constructor(...args) {
        super(...args);

        this.isVoid = htmlVoidTags.has(this.type);

        if (this.isVoid && this.children.length > 0)
            throw new CoolError('Void tags cannot have children.');
    }

    get namespace() {
        return 'http://www.w3.org/1999/xhtml';
    }
}

class SVGComponent extends XMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg';
    }
}

module.exports = {
    Component,
    FactoryComponent,
    XMLComponent,
    HTMLComponent,
    SVGComponent,

    factory: Component.factory.bind(FactoryComponent),
    html:    Component.factory.bind(HTMLComponent),
    svg:     Component.factory.bind(SVGComponent),

    f:       Component.factory.bind(FactoryComponent),
    h:       Component.factory.bind(HTMLComponent),
    s:       Component.factory.bind(HTMLComponent)
};
