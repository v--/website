import ErrorView from 'code/core/views/error';

const DEFAULT_CONFIG = { view: null, route: null, subroutes: [], subroute: null, data: null };

export default class Page {
    static blank = new Page(DEFAULT_CONFIG);

    static fromError(error) {
        return new Page({ view: ErrorView, data: error });
    }

    constructor(config) {
        Object.assign(this, config);
        Object.freeze(this);
    }
}
