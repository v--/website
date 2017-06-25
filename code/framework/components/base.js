const { abstractMethodChecker } = require('common/support/classtools');

module.exports = class AbstractComponent {
    constructor() {
        abstractMethodChecker(this, ['equals', 'dup']);
    }
};
