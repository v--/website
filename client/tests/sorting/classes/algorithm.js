import Algorithm from 'code/sorting/classes/algorithm';

describe('Algorithm.totalOrder', function () {
    it('returns a copy of the original array if it is a zero-based sequence of consecutive numbers', function () {
        const array = [0, 1, 2];
        const uniq = Algorithm.totalOrder(array);
        expect(uniq).not.to.equal(array);
        expect(uniq).to.deep.equal(array);
    });

    it('returns a zero-based sequence of numbers if the original array is sorted and unique', function () {
        const array = [1, 2, 4, 8];
        expect(Algorithm.totalOrder(array)).to.deep.equal([0, 1, 2, 3]);
    });

    it('returns an array of consecutive numbers with the same ordering as the original', function () {
        const array = [5, 7, 3, 8, 2];
        expect(Algorithm.totalOrder(array)).to.deep.equal([2, 3, 1, 4, 0]);
    });

    it('returns an zero-based array of consecutive numbers if the original array is constant', function () {
        const array = [2, 2, 2, 2, 2];
        expect(Algorithm.totalOrder(array)).to.deep.equal([0, 1, 2, 3, 4]);
    });

    it('manages to create a total order out of a partial order', function () {
        const array = [3, 1, 1, 2, 0];
        expect(Algorithm.totalOrder(array)).to.deep.equal([4, 1, 2, 3, 0]);
    });
});
