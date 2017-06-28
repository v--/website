const { expect } = require('tests')

const { zip } = require('common/support/itertools')

describe('zip', function () {
    it('Zips nothing', function () {
        const zipped = zip()
        expect(Array.from(zipped)).to.deep.equal([])
    })

    it('Zips single array', function () {
        const zipped = zip(['a', 'b'])
        expect(Array.from(zipped)).to.deep.equal([['a'], ['b']])
    })

    it('Zips two equinumerous array', function () {
        const zipped = zip(['a', 'b'], [1, 2])
        expect(Array.from(zipped)).to.deep.equal([
            ['a', 1],
            ['b', 2]
        ])
    })

    it("Zips two non-equinumerous array by stopping at the shorter one's size", function () {
        const zipped = zip(['a', 'b', 'c'], [1, 2])
        expect(Array.from(zipped)).to.deep.equal([
            ['a', 1],
            ['b', 2]
        ])
    })

    it('Zips three equinumerous arrays', function () {
        const zipped = zip(['a', 'b', 'c'], ['а', 'б', 'в'], [1, 2, 3])
        expect(Array.from(zipped)).to.deep.equal([
            ['a', 'а', 1],
            ['b', 'б', 2],
            ['c', 'в', 3]
        ])
    })
})
