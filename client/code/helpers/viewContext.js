import { createElement } from 'react';

import View from 'code/helpers/view';

class Empty extends View {
    render() {
        return createElement('div');
    }
}

export default class ViewContext {
    static empty = new ViewContext(Empty);

    constructor(view, data) {
        View.assertInstance(view);
        this.merge({ view, data });
    }
}
