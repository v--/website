'use strict';

require.main.require('client/tests/specHelper');

const utils = require.main.require('client/code/core/helpers/utils').default;

describe('utils', function () {
    describe('#currency', function () {
        it('appends "K" for kibibytes', function () {
            expect(utils.humanizeSize(1024)).to.equal('1 KiB');
        });

        it('appends "M" for mebibytes', function () {
            expect(utils.humanizeSize(123456)).to.equal('0 MiB');
        });
    });

    describe('utils.basename(string, suffix)', function () {
        it('returns an empty string for an empty string', function () {
            expect(utils.basename('')).to.equal('');
        });

        it('returns an empty string current directory', function () {
            expect(utils.basename('lorem/ipsum/')).to.equal('ipsum');
        });

        it('returns the current directory', function () {
            expect(utils.basename('lorem/ipsum/')).to.equal('ipsum');
        });

        it('does not return a leading slash', function () {
            expect(utils.basename('lorem/ipsum/')).not.to.match(/^\//);
        });

        it('does not return a following slash', function () {
            expect(utils.basename('lorem/ipsum/')).not.to.match(/\/$/);
        });

        it('counts multiple neighboring slashes as one', function () {
            expect(utils.basename('lorem///ipsum/')).to.equal('ipsum');
        });

        it('counts multiple neighboring slashes at the end as one', function () {
            expect(utils.basename('lorem/ipsum///')).to.equal('ipsum');
        });

        it('removes a specified suffix from a file name', function () {
            expect(utils.basename('lorem.ipsum', 'ipsum')).to.equal('lorem.');
        });

        it('does not remove a specified suffix from a file name if it is not a the end', function () {
            expect(utils.basename('lorem.ipsum', 'lorem')).to.equal('lorem.ipsum');
        });
    });

    describe('utils.dirname(string)', function () {
        it('returns an empty string for an empty string', function () {
            expect(utils.dirname('')).to.equal('');
        });

        it('returns the parent directory', function () {
            expect(utils.dirname('lorem/ipsum/')).to.equal('lorem');
        });

        it('does not return a following slash', function () {
            expect(utils.dirname('lorem/ipsum/')).not.to.match(/\/$/);
        });

        it('counts multiple neighboring slashes as one', function () {
            expect(utils.dirname('lorem///ipsum/')).to.equal('lorem');
        });

        it('counts multiple neighboring slashes at the end as one', function () {
            expect(utils.dirname('lorem/ipsum///')).to.equal('lorem');
        });
    });

    describe('utils.swap(object, a, b)', function () {
        it('swaps two object keys', function () {
            let object = { a: 0, b: 1 };
            utils.swap(object, 'a', 'b');
            expect(object).to.deep.equal({ a: 1, b: 0 });
        });
    });

    describe('utils.trim(string)', function () {
        it('does nothing with a string without whitespace', function () {
            expect(utils.trim('lorem')).to.equal('lorem');
        });

        it('does nothing with a string with a whitespace between letters', function () {
            expect(utils.trim('lorem ipsum')).to.equal('lorem ipsum');
        });

        it('trims whitespaces at the ends of a string', function () {
            expect(utils.trim('  lorem\t')).to.equal('lorem');
        });
    });
});
