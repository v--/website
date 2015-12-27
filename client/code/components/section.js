import { createElement, Component } from 'react';

import ViewContext from 'code/helpers/viewContext';
import Dispatcher from 'code/helpers/dispatcher';
import Viewport from 'code/helpers/viewport';

export default class Section extends Component {
    get viewport() {
        if (this.state.element === null)
            return Viewport.default;

        return new Viewport(this.state.element.getBoundingClientRect());
    }

    constructor() {
        super();
        this.state = { context: ViewContext.empty, element: null };
        this.unregViewListener = Dispatcher.view.register(::this.onViewUpdate);
        this.unregResizeListener = Dispatcher.resize.register(::this.onResize);
    }

    // @override
    render() {
        const { context } = this.state;

        return createElement('section', null,
            createElement('h1', { className: 'ellipsis' }, context.view.generateHeading(context.data)),
            createElement('div', { className: 'view-container', ref: ::this.setElement },
                createElement(context.view,
                    { data: context.data, viewport: this.viewport }
                )
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
            this.forceUpdate();
    }

    setElement(element) {
        if (this.state.element === null)
            this.setState({
                element: element
            });
    }
}
