const { expect } = require('tests')

const { MethodNotImplementedError, abstractMethodChecker, interfaceFactory } = require('common/support/classtools')

describe('abstractMethodChecker()', () => {
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

describe('interfaceFactory()', function () {
    it('succeeds when an object has all interface properties', function () {
        const interface = interfaceFactory('a', 'b')
        expect({ a: 1, b: 2 }).to.be.an.instanceof(interface)
    })

    it("fails when an object doesn't implement interface properties", function () {
        const interface = interfaceFactory('a', 'b')
        expect({ a: 1 }).to.not.be.an.instanceof(interface)
    })

    it('fails on non-objects', function () {
        const interface = interfaceFactory('a', 'b')
        expect(3).to.not.be.an.instanceof(interface)
    })
})
