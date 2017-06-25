const { abstractMethodChecker } = require('common/support/classtools');
const Renderer = require('framework/renderers/base');

module.exports = class AbstractTextRenderer extends Renderer {
    constructor(component, renderComponent) {
        super(component, renderComponent);
        abstractMethodChecker(this, ['_createNode', '_updateText']);
        this.renderedText = null;
    }

    render() {
        this.renderedText = this.component.text;
        return this.element = this._createNode();
    }

    rerender() {
        if (this.component.text === this.renderedText)
            return;

        this._updateText();
    }

    destroy() {}
};
