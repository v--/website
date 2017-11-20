import { expect } from '../../../code/tests'

import Interface, { InterfaceNotImplementedError, INumber } from '../../../code/common/support/interface'
import { bind } from '../../../code/common/support/functions'

describe('Interface', function () {
    describe('.assert()', () => {
        const IAbstract = Interface.create({ _abstractMethod: Function })

        it('passes if the abstract properties are overridden', function () {
            const object = { _abstractMethod() {} }
            expect(bind(IAbstract, 'assert', object)).to.not.throw(InterfaceNotImplementedError)
        })

        it('throws if the properties implement wrong interfaces', function () {
            const object = { _abstractMethod: false }
            expect(bind(IAbstract, 'assert', object)).to.throw(InterfaceNotImplementedError)
        })

        it('throws if the abstract properties are not overridden', function () {
            const object = {}
            expect(bind(IAbstract, 'assert', object)).to.throw(InterfaceNotImplementedError)
        })
    })

    describe('hasInstance hook', function () {
        it('succeeds if an object has all IAbstract properties', function () {
            const IAbstract = Interface.create({ a: INumber, b: INumber })
            expect({ a: 1, b: 2 }).to.be.an.instanceof(IAbstract)
        })

        it("fails if an object has all IAbstract properties, but they don't satisfy their interfaces", function () {
            const IAbstract = Interface.create({ a: INumber, b: INumber })
            expect({ a: '1', b: 2 }).to.not.be.an.instanceof(IAbstract)
        })

        it("fails if an object doesn't implement IAbstract properties", function () {
            const IAbstract = Interface.create({ a: INumber, b: INumber })
            expect({ a: 1 }).to.not.be.an.instanceof(IAbstract)
        })

        it('fails on non-objects', function () {
            const IAbstract = Interface.create({ a: INumber, b: INumber })
            expect(3).to.not.be.an.instanceof(IAbstract)
        })

        it("fails if an property does not satisfy it's interface", function () {
            const IAbstract = Interface.create({ a: INumber, b: INumber })
            expect(3).to.not.be.an.instanceof(IAbstract)
        })
    })
})
