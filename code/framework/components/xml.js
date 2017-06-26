const NodeComponent = require('framework/components/node')
const { abstractMethodChecker } = require('common/support/classtools')

module.exports = class AbtractXMLComponent extends NodeComponent {
    constructor(type, options, children) {
        super(type, options, children)
        abstractMethodChecker(this, ['namespace'])
    }
}
