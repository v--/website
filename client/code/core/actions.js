import { Store } from 'vuex';

import Page from 'code/core/classes/page';
import CoolError from 'code/core/classes/coolError';
import routes from 'code/core/routes/index';
import cookies from 'code/core/helpers/cookies';
import browser from 'code/core/helpers/browser';

const module = {
    updatePage(store: Store, path: string) {
        const route = routes.find(route => route.testPath(path));

        if (route === undefined) {
            module.handleError(store, CoolError.HTTP.notFound);
            return;
        }

        Promise.all([route.resolve(path), route.resolveChildren(path)])
            .then(function (response: Object) {
                const [view, subroutes] = response,
                    subroute = subroutes.find(route => route.testPath(path));

                if (view === undefined) {
                    module.handleError(store, CoolError.HTTP.notFound);
                    return;
                }

                return view.resolve(path).then(function (data) {
                    const page = new Page({ view, route, subroutes, subroute, data: data });
                    browser.updateWindowTitle(view.getTitle(data));
                    store.dispatch('UPDATE_PAGE', page);
                });
            });
    },

    updatePath(store: Store, path: string) {
        if (browser.getPath() !== path)
            browser.pushState(path);

        module.updatePage(store, path);
    },

    handleError(store: Store, error: Error) {
        browser.updateWindowTitle(['error']);
        console.error(error); // eslint-disable-line no-console
        store.dispatch('HANDLE_ERROR', error);
    },

    setExpanded(store: Store, expanded: boolean) {
        cookies.set('expanded', JSON.stringify(expanded));
        store.dispatch('UPDATE_EXPANDED', expanded);
    }
};

export default module;
