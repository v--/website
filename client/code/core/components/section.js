import ViewContext from 'code/core/helpers/viewContext';
import Viewport from 'code/core/helpers/viewport';
import { Component, $ } from 'code/core/helpers/component';

export default class Section extends Component {
    get viewport() {
        if (this.state.element === null)
            return Viewport.default;

        return new Viewport(this.state.element.getBoundingClientRect());
    }

    constructor() {
        super();
        this.state = { context: ViewContext.empty, element: null };
        this.subscribe('view:new', 'onViewUpdate');
        this.subscribe('resize', 'onResize');
    }

    // @override
    render() {
        const { context } = this.state;

        return $('section', null,
            $('h1', { className: 'ellipsis' }, context.view.generateHeading(context.data)),
            $('div', { className: 'view-container', ref: ::this.setElement },
                $(context.view,
                    { data: context.data, viewport: this.viewport }
                )
            )
        );
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
