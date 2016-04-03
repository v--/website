import Route from 'code/core/classes/route';
import browser from 'code/core/helpers/browser';

export default new Route({
    name: 'breakout',
    path: '/code/breakout',
    resolve() {
        browser.injectStylesheet('katex');
        return browser.injectScript('breakout').then(function () {
            return require('code/breakout/view').default;
        });
    }
});

