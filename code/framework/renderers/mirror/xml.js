const AbstractXMLRenderer = require('framework/renderers/xml')

const { createComponent } = require('framework/c')

module.exports = class MirrorXMLRenderer extends AbstractXMLRenderer {
    _createNode() {
        return createComponent(this.component.constructor, this.component.type)
    }

    _setOption(key, value) {
        this.element.options.set(key, value)
    }

    _deleteOption(key) {
        this.element.options.delete(key)
    }

    _appendChild(child) {
        this.element.children.push(child)
    }
}
