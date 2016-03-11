import Route from 'code/core/classes/route';
import browser from 'code/core/helpers/browser';

export default new Route({
    name: 'sorting',
    path: '/code/sorting',
    resolve() {
        browser.injectStylesheet('katex');
        return browser.injectScript('sorting').then(function () {
            return require('code/sorting/view').default;
        });
    }
});

