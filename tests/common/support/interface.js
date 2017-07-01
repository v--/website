const { expect } = require('tests')

const { InterfaceNotImplementedError, assertInterface, interfaceFactory } = require('common/support/interface')

describe('assertInterface()', () => {
    class Abstract {
        constructor() {
            assertInterface(this, ['_abstractMethod'])
        }
    }

    it('passes when the abstract properties are overridden', function () {
        class Valid extends Abstract {
            _abstractMethod() {}
        }

        expect(() => new Valid()).to.not.throw(InterfaceNotImplementedError)
    })

    it('throws when the abstract properties are not overridden', function () {
        class Invalid extends Abstract {}
        expect(() => new Invalid()).to.throw(InterfaceNotImplementedError)
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
