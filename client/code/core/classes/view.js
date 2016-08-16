import Vue from 'vue';

import { factorize, functionize, noopAsync } from 'code/core/support/functional';

function getTitle(name, title) {
    if (!title)
        return factorize([name]);

    if (typeof title === 'string')
        return factorize([title]);

    return functionize(title);
}

export default class View {
    constructor({ name, title, component, testPath, inject = false, resolve = noopAsync }) {
        Object.assign(this, {
            name, component, resolve,
            testPath: testPath || (path => path === `/${name}`),
            getTitle: getTitle(name, title),
        });

        if (inject)
            Vue.component(`iv-${name}`, component);

        Object.freeze(this);
    }
}
