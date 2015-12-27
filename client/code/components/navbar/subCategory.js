import { createElement, Component, PropTypes } from 'react';

import NavigationContext from 'code/helpers/navigationContext';
import classSet from 'code/helpers/classSet';
import View from 'code/helpers/view';
import { go } from 'code/router';

export default class NavbarSubCategory extends Component {
    static propTypes = {
        view: props => View.propTypeCheck(props.view),
        context: PropTypes.instanceOf(NavigationContext)
    }

    // @override
    render() {
        return createElement('a',
            {
                className: this.classeName,
                onClick: go.partial(this.props.view.route)
            },

            this.props.view.title
        );
    }

    onClick(e) {
        e.preventDefault();
        go(this.props.route);
    }

    get isActive() {
        return this.props.view === this.props.context.subview;
    }

    get classeName() {
        return classSet(
            'button',
            'navbar-button',
            'navbar-sub-category-button',
            this.isActive && 'active'
        );
    }
}
