/* eslint-env browser */

const AbstractTextRenderer = require('framework/renderers/text')

module.exports = class MirrorTextRenderer extends AbstractTextRenderer {
    _createNode() {
        return document.createTextNode(this.component.text)
    }

    _updateText() {
        this.element.innerText = this.component.text
    }
}
