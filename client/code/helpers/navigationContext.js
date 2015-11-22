import View from 'code/helpers/view';

export default class NavigationContext {
    constructor(view, subviews: Array = [], subview = null) {
        View.assertInstance(view);
        subviews.forEach(::View.assertInstance);

        if (subview !== null)
            View.assertInstance(subview);

        this.merge({ view, subviews, subview });
    }
}
