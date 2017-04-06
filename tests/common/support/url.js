const URL = require('common/support/url');

describe('URL', function () {
    it('Works with single slash', function () {
        expect(new URL('/')).to.deep.equal({
            route: '',
            subroute: ''
        });
    });

    it('Works with a basic route', function () {
        expect(new URL('/files')).to.deep.equal({
            route: 'files',
            subroute: ''
        });
    });

    it('Works with a basic route with an ending slash', function () {
        expect(new URL('/files/')).to.deep.equal({
            route: 'files',
            subroute: ''
        });
    });

    it('Works with a subroute', function () {
        expect(new URL('/bamboozled/yet.again')).to.deep.equal({
            route: 'bamboozled',
            subroute: 'yet.again'
        });
    });
});
