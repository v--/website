import View from 'code/core/classes/view';
import Route from 'code/core/classes/route';

type PageConfig = {
    view: View | null,
    route: Route | null,
    subroutes: Route[],
    subroute: Route | null,
    data: Object | null
};

export default class Page {
    static blank = new Page({ view: null, route: null, subroutes: [], subroute: null, data: null });

    constructor(config: PageConfig) {
        // BEGIN HACK: Vuex expects enumerable properties to set up watchers. Hahaha.
        for (let key in config)
            Object.defineProperty(this, key, { value: config[key] });
        // END HACK

        Object.freeze(this);
    }
}
