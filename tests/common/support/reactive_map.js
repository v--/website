const { expect } = require('tests')

const ReactiveMap = require('common/support/reactive_map')

describe('ReactiveMap', function () {
    describe('.updated', function () {
        it("Doesn't find differences on identical sets", function () {
            const a = ReactiveMap.fromObject({ a: 1, b: 2 })
            const b = ReactiveMap.fromObject({ a: 1, b: 2 })

            expect(a.updated(b)).to.iterate.over([])
        })

        it('Finds a single value difference', function () {
            const a = ReactiveMap.fromObject({ a: 1 })
            const b = ReactiveMap.fromObject({ a: 2 })

            expect(a.updated(b)).to.iterate.over(['a'])
        })
    })

    describe('.diff', function () {
        it('Finds a single value difference', function () {
            const a = ReactiveMap.fromObject({ a: 1 })
            const b = ReactiveMap.fromObject({ b: 2 })

            expect(a.diff(b)).to.iterate.over(['a'])
        })
    })
})
