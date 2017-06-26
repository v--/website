const { describe, it, expect } = require('tests')

const StringBuffer = require('common/support/string_buffer')

describe('StringBuffer', function () {
    it('Buffers an empty array', function () {
        const buffered = new StringBuffer([])
        expect(buffered.exhausted).to.be.true
    })

    it('Buffers a string that is shorter than expected', function () {
        const buffered = new StringBuffer(['asdf'])
        expect(buffered.exhausted).to.be.false
        expect(buffered.read(10)).to.equal('asdf')
        expect(buffered.exhausted).to.be.true
    })

    it('Buffers a string that is longer than expected', function () {
        const buffered = new StringBuffer(['asdf'])
        expect(buffered.exhausted).to.be.false
        expect(buffered.read(2)).to.equal('as')
        expect(buffered.read(2)).to.equal('df')
        expect(buffered.exhausted).to.be.true
    })

    it('Buffers multiple string that do not match the buffer reading paces', function () {
        const buffered = new StringBuffer(['a', 'sd', 'fgh'])
        expect(buffered.exhausted).to.be.false
        expect(buffered.read(2)).to.equal('as')
        expect(buffered.read(2)).to.equal('df')
        expect(buffered.read(2)).to.equal('gh')
        expect(buffered.exhausted).to.be.true
    })
})
