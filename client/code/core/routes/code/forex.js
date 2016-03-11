import Route from 'code/core/classes/route';
import browser from 'code/core/helpers/browser';

export default new Route({
    name: 'forex',
    path: '/code/forex',
    resolve() {
        return browser.injectScript('forex').then(function () {
            return require('code/forex/view').default;
        });
    }
});

