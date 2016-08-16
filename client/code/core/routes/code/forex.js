import Route from 'code/core/classes/route';
import { injectScript } from 'code/core/support/browser';

export default new Route({
    name: 'forex',
    path: '/code/forex',
    resolve() {
        return injectScript('forex');
    }
});

