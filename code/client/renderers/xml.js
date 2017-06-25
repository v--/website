/* eslint-env browser */

const AbstractXMLRenderer = require('framework/renderers/xml');

module.exports = class MirrorXMLRenderer extends AbstractXMLRenderer {
    _createNode() {
        return document.createElementNS(this.component.namespace, this.component.type);
    }

    _setOption(key, value) {
        this.element.setAttribute(key, String(value));
    }

    _deleteOption(key) {
        this.element.removeAttribute(key);
    }

    _appendChild(child) {
        this.element.appendChild(child);
    }
};
