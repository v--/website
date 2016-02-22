import _ from 'lodash';


import { $ } from 'code/core/helpers/component';

import View from 'code/core/helpers/view';

class Empty extends View.generate('empty') {
    render() {
        return $('div');
    }
}

export default class ViewContext {
    static empty = new ViewContext(Empty);

    constructor(view, data) {
        View.assertInstance(view);
        _.merge(this, { view, data });
    }
}
