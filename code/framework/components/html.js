const { CoolError } = require('common/errors');
const AbstractXMLComponent = require('framework/components/xml');

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

module.exports = class HTMLComponent extends AbstractXMLComponent {
    constructor(...args) {
        super(...args);

        this.isVoid = htmlVoidTags.has(this.type);

        if (this.isVoid && this.children.length > 0)
            throw new CoolError('Void tags cannot have children.');
    }

    get namespace() {
        return 'http://www.w3.org/1999/xhtml';
    }
};
