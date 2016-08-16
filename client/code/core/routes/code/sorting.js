import Route from 'code/core/classes/route';
import { injectStylesheet, injectScript } from 'code/core/support/browser';

export default new Route({
    name: 'sorting',
    path: '/code/sorting',
    resolve() {
        injectStylesheet('katex');
        return injectScript('sorting');
    }
});
