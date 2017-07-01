/* eslint-env browser */

const { renderDispatcherFactory, XMLRenderer, FactoryRenderer } = require('common/renderer')

class DOMXMLRenderer extends XMLRenderer {
    _createNode() {
        return document.createElementNS(this.component.namespace, this.component.type)
    }

    _setOption(key, value) {
        this.element.setAttribute(key, String(value))
    }

    _updateText() {
        this.element.innerText = this.component.options.text
    }

    _deleteOption(key) {
        this.element.removeAttribute(key)
    }

    _appendChild(child) {
        this.element.appendChild(child)
    }
}

class DOMFactoryRenderer extends FactoryRenderer {}

module.exports = {
    DOMXMLRenderer,
    DOMFactoryRenderer,
    render: renderDispatcherFactory(DOMXMLRenderer, DOMFactoryRenderer)
}
