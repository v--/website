const { renderDispatcherFactory, XMLRenderer, FactoryRenderer } = require('common/renderer')

class MirrorXMLRenderer extends XMLRenderer {
    _createNode() {
        return this.component.constructor.safeCreate(this.component.type)
    }

    _setOption(key, value) {
        this.element.options[key] = value
    }

    _updateText() {
        this.element.options.text = this.component.options.text
    }

    _deleteOption(key) {
        this.element.options.delete(key)
    }

    _appendChild(child) {
        this.element.children.push(child)
    }
}

class MirrorFactoryRenderer extends FactoryRenderer {}

module.exports = {
    MirrorXMLRenderer,
    MirrorFactoryRenderer,
    render: renderDispatcherFactory(MirrorXMLRenderer, MirrorFactoryRenderer)
}
