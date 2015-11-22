import { createElement, Component } from 'react';

import ViewContext from 'code/helpers/viewContext';
import Dispatcher from 'code/helpers/dispatcher';
import Viewport from 'code/helpers/viewport';

export default class Section extends Component {
    get viewport() {
        if (this.element === null)
            return Viewport.default;

        return new Viewport(this.element.getBoundingClientRect());
    }

    constructor() {
        super();
        this.state = { context: ViewContext.empty };
        this.element = null;
        this.unregViewListener = Dispatcher.view.register(::this.onViewUpdate);
        this.unregResizeListener = Dispatcher.resize.register(::this.onResize);
    }

    // @override
    render() {
        const { context } = this.state;

        return createElement('section', { ref: ::this.setElement },
            createElement(context.view,
                { data: context.data, viewport: this.viewport }
            )
        );
    }

    // @override
    componentWillUnmount() {
        this.unregViewListener();
        this.unregRouteListener();
        this.unregResizeListener();
    }

    onViewUpdate(context: ViewContext) {
        this.setState({ context });
    }

    onResize() {
        if (this.state.context.view.updateOnResize)
            this.forceUpdate.debounce(50);
    }

    setElement(element) {
        this.element = element;
    }
}
