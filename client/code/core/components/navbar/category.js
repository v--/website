import _ from 'lodash';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import NavbarSubCategory from 'code/core/components/navbar/subCategory';
import Icon from 'code/core/components/icon';
import View from 'code/core/classes/view';
import NavigationContext from 'code/core/helpers/navigationContext';
import classSet from 'code/core/helpers/classSet';
import { go } from 'code/core/router';
import { ANIM_DURATION } from 'code/core/constants/style';
import { Component, props, $ } from 'code/core/helpers/component';

export default class NavbarCategory extends Component {
    static propTypes = {
        view: props => View.propTypeCheck(props.view),
        context: props.instanceOf(NavigationContext)
    }

    get isActive() {
        // Initially there is no context
        return this.props.view === _.get(this.props, ['context', 'view']);
    }

    get subviews() {
        if (!this.isActive)
            return [];

        return _.map(this.props.context.subviews, (subview, index) =>
            $(NavbarSubCategory,
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
        return $('div', null,
            $('a',
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

                $(Icon,
                    {
                        name: this.props.view.icon,
                        fixedWidth: true,
                        className: 'navbar-icon navbar-category-icon'
                    }),

                    $('span', {
                        className: 'navbar-category-text'
                    },

                    this.props.view.title
                ),

                $(Icon, {
                    style: {
                        visibility: this.props.view.hasSubviews ? 'visible' : 'hidden'
                    },
                    fixedWidth: true,
                    className: 'navbar-icon navbar-category-icon',
                    name: 'chevron-down',
                    verticalFlip: this.isActive
                })
            ),

            $(CSSTransitionGroup,
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
