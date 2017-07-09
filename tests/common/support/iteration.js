const { expect } = require('tests')

const { EmptyIterError, reduce, range, zip } = require('common/support/iteration')

describe('zip()', function () {
    it('zips nothing', function () {
        const zipped = zip()
        expect(zipped).to.deep.iterate.over([])
    })

    it('zips single array', function () {
        const zipped = zip(['a', 'b'])
        expect(zipped).to.deep.iterate.over([['a'], ['b']])
    })

    it('zips two equinumerous array', function () {
        const zipped = zip(['a', 'b'], [1, 2])
        expect(zipped).to.deep.iterate.over([
            ['a', 1],
            ['b', 2]
        ])
    })

    it("zips two non-equinumerous array by stopping at the shorter one's size", function () {
        const zipped = zip(['a', 'b', 'c'], [1, 2])
        expect(zipped).to.deep.iterate.over([
            ['a', 1],
            ['b', 2]
        ])
    })

    it('zips three equinumerous arrays', function () {
        const zipped = zip(['a', 'b', 'c'], ['а', 'б', 'в'], [1, 2, 3])
        expect(zipped).to.deep.iterate.over([
            ['a', 'а', 1],
            ['b', 'б', 2],
            ['c', 'в', 3]
        ])
    })
})

describe('reduce()', function () {
    it('throws when trying to reduce nothing', function () {
        expect(reduce.bind(null, Boolean, [])).to.throw(EmptyIterError)
    })

    it("doesn't throw when trying to reduce nothing with a default value", function () {
        expect(reduce.bind(null, Boolean, [], 'default')).not.to.throw(EmptyIterError)
    })

    it('correctly sums an array of values', function () {
        expect(reduce((a, b) => a + b, range(5), 0)).to.equal(10)
    })
})
