/* eslint-env browser */

const { XMLRenderer } = require('common/renderer')
const Interface = require('common/support/interface')

module.exports = class DOMXMLRenderer extends XMLRenderer {
    _createNode() {
        return document.createElementNS(this.component.namespace, this.component.type)
    }

    _setAttribute(key, value) {
        if (value instanceof Interface.IFunction)
            this.element.addEventListener(key, value)
        else
            this.element.setAttribute(key, String(value))
    }

    _removeAttribute(key, oldValue) {
        if (oldValue instanceof Interface.IFunction)
            this.element.removeEventListener(key, oldValue)
        else
            this.element.removeAttribute(key)
    }

    _setText() {
        this.element.textContent = this.component.state.current.text
    }

    _removeText() {
        this.element.textContent = ''
    }

    _appendChild(child) {
        this.element.appendChild(child)
    }

    _replaceChild(oldChild, newChild) {
        this.element.replaceChild(newChild, oldChild)
    }

    _removeChild(child) {
        this.element.removeChild(child)
    }
}
