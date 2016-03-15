import View from 'code/core/classes/view';
import Route from 'code/core/classes/route';
import ErrorView from 'code/core/views/error';

type PageConfig = {
    view: View | null,
    route: Route | null,
    subroutes: Route[],
    subroute: Route | null,
    data: Object | null
};

const DEFAULT_CONFIG = { view: null, route: null, subroutes: [], subroute: null, data: null };

export default class Page {
    static blank = new Page(DEFAULT_CONFIG);

    static fromError(error: Error) {
        return new Page(Object.assign({}, DEFAULT_CONFIG, { view: ErrorView, data: error }));
    }

    constructor(config: PageConfig) {
        // BEGIN HACK: Vuex expects enumerable properties to set up watchers. Hahaha.
        for (let key in config)
            Object.defineProperty(this, key, { value: config[key] });
        // END HACK

        Object.freeze(this);
    }
}
