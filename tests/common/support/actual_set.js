const { describe, it, expect } = require('tests');

const ActualSet = require('common/support/actual_set');

describe('ActualSet', function () {
    const a = new ActualSet([1, 2]);
    const b = new ActualSet([2, 3]);

    describe('.union', function () {
        it('works', function () {
            expect(a.union(b).keys()).to.iterate.over([1, 2, 3]);
        });
    });

    describe('.intersection', function () {
        it('works', function () {
            expect(a.intersection(b).keys()).to.iterate.over([2]);
        });
    });

    describe('.diff', function () {
        it('works', function () {
            expect(a.diff(b).keys()).to.iterate.over([1]);
        });
    });

    describe('.symmetricDiff', function () {
        it('works', function () {
            expect(a.symmetricDiff(b).keys()).to.iterate.over([1, 3]);
        });
    });
});
