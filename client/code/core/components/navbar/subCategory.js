import _ from 'lodash';

import NavigationContext from 'code/core/helpers/navigationContext';
import classSet from 'code/core/helpers/classSet';
import View from 'code/core/helpers/view';
import { Component, props, $ } from 'code/core/helpers/component';
import { go } from 'code/core/router';

export default class NavbarSubCategory extends Component {
    static propTypes = {
        view: props => View.propTypeCheck(props.view),
        context: props.instanceOf(NavigationContext)
    }

    // @override
    render() {
        return $('a',
            {
                className: this.classeName,
                onClick: _.partial(go, this.props.view.route)
            },

            this.props.view.title
        );
    }

    onClick(e) {
        e.preventDefault();
        go(this.props.route);
    }

    get isActive() {
        return this.props.view.title === _.get(this.props.context.subview, 'title');
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
