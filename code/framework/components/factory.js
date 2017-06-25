const NodeComponent = require('framework/components/node');

module.exports = class FactoryComponent extends NodeComponent {
    evaluate() {
        return this.type({
            options: this.options,
            children: this.children
        });
    }
};
