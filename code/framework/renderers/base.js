const { abstractMethodChecker } = require('common/support/classtools');

module.exports = class AbstractRenderer {
    constructor(component, renderComponent) {
        abstractMethodChecker(this, ['render', 'rerender', 'destroy']);
        this.renderComponent = renderComponent;
        this.component = component;
        this.element = null;
    }
};
