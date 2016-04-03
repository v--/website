import Vue from 'vue';

import utils from 'code/core/helpers/utils';

type ViewConfig = {
    name: string,
    component: Object,
    title: string | ?string[] | ?Function,
    inject: ?boolean,
    testPath: ?Function,
    resolve: ?Function
};

function getTitle(config: ViewConfig) {
    if (!('title' in config))
        return utils.returns([config.name]);

    if (typeof config.title === 'string')
        return utils.returns([config.title]);

    return utils.functionize(config.title);
}

export default class View {
    constructor(config: ViewConfig) {
        Object.assign(this, {
            name: config.name,
            component: config.component,
            testPath: config.testPath || (path => path === `/${config.name}`),
            getTitle: getTitle(config),
            resolve: config.resolve || utils.noopAsync
        });

        if (config.inject)
            Vue.component(`iv-${config.name}`, config.component);

        Object.freeze(this);
    }
}
