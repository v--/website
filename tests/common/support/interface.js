const { expect } = require('tests')

const Interface = require('common/support/interface')

describe('Interface', function () {
    describe('.assert()', () => {
        const IAbstract = Interface.create('_abstractMethod')

        class Abstract {
            constructor() {
                IAbstract.assert(this)
            }
        }

        it('passes when the abstract properties are overridden', function () {
            class Valid extends Abstract {
                _abstractMethod() {}
            }

            expect(() => new Valid()).to.not.throw(Interface.InterfaceNotImplementedError)
        })

        it('throws when the abstract properties are not overridden', function () {
            class Invalid extends Abstract {}
            expect(() => new Invalid()).to.throw(Interface.InterfaceNotImplementedError)
        })
    })

    describe('hasInstance hook', function () {
        it('succeeds when an object has all IAbstract properties', function () {
            const IAbstract = Interface.create('a', 'b')
            expect({ a: 1, b: 2 }).to.be.an.instanceof(IAbstract)
        })

        it("fails when an object doesn't implement IAbstract properties", function () {
            const IAbstract = Interface.create('a', 'b')
            expect({ a: 1 }).to.not.be.an.instanceof(IAbstract)
        })

        it('fails on non-objects', function () {
            const IAbstract = Interface.create('a', 'b')
            expect(3).to.not.be.an.instanceof(IAbstract)
        })
    })
})
