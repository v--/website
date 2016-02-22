import _ from 'lodash';

import View from 'code/core/helpers/view';

export default class NavigationContext {
    constructor(view, subviews: Array = [], subview = null) {
        View.assertInstance(view);
        _.forEach(subviews, ::View.assertInstance);

        if (subview !== null)
            View.assertInstance(subview);

        _.merge(this, { view, subviews, subview });
    }
}
