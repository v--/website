const AbstractTextRenderer = require('framework/renderers/text');
const TextComponent = require('framework/components/text');

module.exports = class MirrorTextRenderer extends AbstractTextRenderer {
    _createNode() {
        return new TextComponent(this.component.text);
    }

    _updateText() {
        this.element.text = this.component.text;
    }
};
