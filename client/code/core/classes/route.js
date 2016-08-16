import { startsWith } from 'code/core/support/misc';
import { asyncFactorize } from 'code/core/support/functional';
import views from 'code/core/views/index';

function getChildrenResolver(children) {
    if (!children)
        return asyncFactorize([]);

    if (children instanceof Function)
        return path => Promise.resolve(children(path));

    return asyncFactorize(children);
}

function wrapResolver(resolver, path) {
    if (resolver) {
        return path => Promise.resolve(resolver(path));
    }

    const view = views.find(view => view.testPath(path));

    return function (path) {
        return new Promise(resolve => view.testPath(path) ? resolve(view) : resolve([]));
    };
}

export default class Route {
    constructor({ name, path, children, resolve: resolver }) {
        Object.assign(this, {
            name, path,
            hasChildren: children !== undefined,
            pathFragments: path.split('/'),
            resolveChildren: getChildrenResolver(children),
            resolve: wrapResolver(resolver, path)
        });

        Object.freeze(this);
    }

    testPath(path) {
        return startsWith(path.split('/'), this.pathFragments);
    }
}
