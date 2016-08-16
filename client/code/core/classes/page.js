import ErrorView from 'code/core/views/error';

const DEFAULT_CONFIG = { view: null, route: null, subroutes: [], subroute: null, data: null };

export default class Page {
    static blank = new Page(DEFAULT_CONFIG);

    static fromError(error) {
        return new Page({ view: ErrorView, data: error });
    }

    constructor(config) {
        // BEGIN HACK: Vue expects enumerable properties to set up watchers. Hahaha.
        for (let key in config)
            Object.defineProperty(this, key, { value: config[key] });
        // END HACK

        Object.freeze(this);
    }
}
