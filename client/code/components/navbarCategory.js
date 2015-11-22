import CSSTransitionGroup from 'react-addons-css-transition-group';
import { createElement, Component, PropTypes } from 'react';

import NavbarSubCategory from 'code/components/navbarSubCategory';
import Fa from 'code/components/fa';
import View from 'code/helpers/view';
import NavigationContext from 'code/helpers/navigationContext';
import classSet from 'code/helpers/classSet';
import { go } from 'code/router';
import { ANIM_DURATION } from 'code/constants/style';

export default class NavbarCategory extends Component {
    static propTypes = {
        view: props => View.propTypeCheck(props.view),
        context: PropTypes.instanceOf(NavigationContext)
    }

    get isActive() {
        // Initially there is no context
        return this.props.view === this.props.query('context.view');
    }

    get subviews() {
        if (!this.isActive)
            return [];

        return this.props.context.subviews.map((subview, index) =>
            createElement(NavbarSubCategory,
                { key: index, view: subview, context: this.props.context }
            )
        );
    }

    constructor() {
        super();
        this.state = { expanded: false };
    }

    // @override
    render() {
        return createElement('div', null,
            createElement('a',
                {
                    onClick: ::this.openPage,
                    href: this.props.view.route,
                    className: classSet(
                        'button',
                        'navbar-button',
                        'navbar-category-button',
                        this.isActive && 'active'
                    )
                },

                createElement(Fa,
                    {
                        name: this.props.view.icon,
                        fixedWidth: true,
                        className: 'navbar-icon navbar-category-icon'
                    }),

                    createElement('span', {
                        className: 'navbar-category-text'
                    },

                    this.props.view.title
                ),

                createElement(Fa, {
                    style: {
                        visibility: this.props.view.hasSubviews ? 'visible' : 'hidden'
                    },
                    fixedWidth: true,
                    className: 'navbar-icon navbar-category-icon',
                    name: 'chevron-down',
                    verticalFlip: this.isActive
                })
            ),

            createElement(CSSTransitionGroup,
                {
                    transitionName: 'button-accordeon',
                    transitionEnterTimeout: ANIM_DURATION,
                    transitionLeaveTimeout: ANIM_DURATION
                },

                this.subviews
            )
        );
    }

    openPage(e) {
        e.preventDefault();
        go(this.props.view.route);
    }
}
