const AbstractComponent = require('framework/components/base')
const { all, zip } = require('common/support/itertools')

module.exports = class NodeComponent extends AbstractComponent {
    constructor(type, options, children) {
        super()
        this.type = type
        this.options = options
        this.children = children
    }

    equals(other) {
        return this.type === other.type &&
            this.options.equals(other.options) &&
            this.children.length === other.children.length &&
            all(([a, b]) => a.equals(b), zip(this.children, other.children))
    }

    dup() {
        return new this.constructor(this.type, this.options.dup(), Array.from(this.children))
    }
}
