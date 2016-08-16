import { humanizeSize } from 'code/core/support/numeric';

describe('humanizeSize', function () {
    it('appends "K" for kibibytes', function () {
        expect(humanizeSize(1024)).to.equal('1.00 KiB');
    });

    it('appends "M" for mebibytes', function () {
        expect(humanizeSize(1234567)).to.equal('1.18 MiB');
    });
});
