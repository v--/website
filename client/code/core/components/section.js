import ViewContext from 'code/core/classes/viewContext';
import Viewport from 'code/core/classes/viewport';
import { Component, $ } from 'code/core/helpers/component';

export default class Section extends Component {
    get viewport() {
        if (!this.refs.viewContainer)
            return Viewport.default;

        return new Viewport(this.refs.viewContainer.getBoundingClientRect());
    }

    constructor() {
        super();
        this.state = { context: ViewContext.empty };
        this.subscribe('view:new', 'onViewUpdate');
        this.subscribe('resize', 'onResize');
    }

    // @override
    render() {
        const { context } = this.state;

        return $('section', null,
            $('h1', { className: 'ellipsis' }, context.view.generateHeading(context.data)),
            $('div', { className: 'view-container', ref: 'viewContainer' },
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
}
