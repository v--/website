import { basename, dirname, capitalize } from 'code/core/support/misc';

describe('basename', function () {
    it('factorize an empty string for an empty string', function () {
        expect(basename('')).to.equal('');
    });

    it('factorize an empty string current directory', function () {
        expect(basename('lorem/ipsum/')).to.equal('ipsum');
    });

    it('factorize the current directory', function () {
        expect(basename('lorem/ipsum/')).to.equal('ipsum');
    });

    it('does not return a leading slash', function () {
        expect(basename('lorem/ipsum/')).not.to.match(/^\//);
    });

    it('does not return a following slash', function () {
        expect(basename('lorem/ipsum/')).not.to.match(/\/$/);
    });

    it('counts multiple neighboring slashes as one', function () {
        expect(basename('lorem///ipsum/')).to.equal('ipsum');
    });

    it('counts multiple neighboring slashes at the end as one', function () {
        expect(basename('lorem/ipsum///')).to.equal('ipsum');
    });

    it('removes a specified suffix from a file name', function () {
        expect(basename('lorem.ipsum', 'ipsum')).to.equal('lorem.');
    });

    it('does not remove a specified suffix from a file name if it is not a the end', function () {
        expect(basename('lorem.ipsum', 'lorem')).to.equal('lorem.ipsum');
    });
});

describe('dirname', function () {
    it('factorize an empty string for an empty string', function () {
        expect(dirname('')).to.equal('');
    });

    it('factorize the parent directory', function () {
        expect(dirname('lorem/ipsum/')).to.equal('lorem');
    });

    it('does not return a following slash', function () {
        expect(dirname('lorem/ipsum/')).not.to.match(/\/$/);
    });

    it('counts multiple neighboring slashes as one', function () {
        expect(dirname('lorem///ipsum/')).to.equal('lorem');
    });

    it('counts multiple neighboring slashes at the end as one', function () {
        expect(dirname('lorem/ipsum///')).to.equal('lorem');
    });
});

describe('capitalize', function() {
    it('returns an empty string when passed an empty string', function() {
        expect(capitalize('')).to.equal('');
    });

    it('capitalizes a single word', function() {
        expect(capitalize('lorem')[0]).to.equal('L');
    });

    it('does not change the entire word', function() {
        expect(capitalize('LoreM')).to.equal('LoreM');
    });
});
