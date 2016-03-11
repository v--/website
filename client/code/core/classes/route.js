import utils from 'code/core/helpers/utils';
import views from 'code/core/views/index';

type RouteConfig = {
    name: string,
    path: string,
    resolve: ?Function,
    children: ?Function | ?Route[],
};

function getChildrenResolver(config: RouteConfig) {
    if (!('children' in config))
        return utils.returnsAsync([]);

    if (config.children instanceof Function)
        return path => Promise.resolve(config.children(path));

    return utils.returnsAsync(config.children);
}

function getResolver(config: RouteConfig) {
    if (!('resolve' in config)) {
        const view = views.find(view => view.testPath(config.path));

        return function (path) {
            return new Promise(resolve => view.testPath(path) ? resolve(view) : resolve);
        };
    }

    return path => Promise.resolve(config.resolve(path));
}

export default class Route {
    constructor(config: RouteConfig) {
        this.hasChildren = 'children' in config;

        Object.assign(this, {
            name: config.name,
            path: config.path,
            pathFragments: config.path.split('/'),
            resolveChildren: getChildrenResolver(config),
            resolve: getResolver(config)
        });

        Object.freeze(this);
    }

    testPath(path: string): boolean {
        return utils.startsWith(path.split('/'), this.pathFragments);
    }
}
