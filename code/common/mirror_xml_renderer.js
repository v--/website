const { XMLRenderer } = require('common/renderer')

module.exports = class MirrorXMLRenderer extends XMLRenderer {
    _createNode() {
        return this.component.constructor.safeCreate(this.component.type, this.component.state.source)
    }

    _setAttribute(key, value) {
        this.element.state.current[key] = value
    }

    _deleteAttribute(key, oldValue) { // eslint-disable-line no-unused-vars
        delete this.element.state.current[key]
    }

    _updateText() {
        this.element.state.current.text = this.component.state.current.text
    }

    _appendChild(child) {
        this.element.children.push(child)
    }

    _replaceChild(oldChild, newChild) {
        const index = this.element.children.indexOf(oldChild)
        this.element.children[index] = newChild
    }

    _removeChild(child) {
        const index = this.element.children.indexOf(child)
        this.element.children.splice(index, 1)
    }
}
