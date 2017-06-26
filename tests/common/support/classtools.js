const { describe, it, expect } = require('tests')

const { MethodNotImplementedError, abstractMethodChecker } = require('code/common/support/classtools')

describe('abstractMethodChecker', () => {
    class Abstract {
        constructor() {
            abstractMethodChecker(this, ['_abstractMethod'])
        }
    }

    it('passes when the abstract methods are inherited', function () {
        class Valid extends Abstract {
            _abstractMethod() {}
        }

        expect(() => new Valid()).to.not.throw(MethodNotImplementedError)
    })

    it('throws when the abstract methods are not inherited', function () {
        class Invalid extends Abstract {}
        expect(() => new Invalid()).to.throw(MethodNotImplementedError)
    })
})
