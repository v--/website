import _ from 'lodash';
import monster from 'cookie-monster';

import classSet from 'code/core/helpers/classSet';
import NavigationContext from 'code/core/helpers/navigationContext';
import SidebarCategory from 'code/core/components/navbar/category';
import Fa from 'code/core/components/fa';
import { Component, $ } from 'code/core/helpers/component';
import { TABLET_WIDTH } from 'code/core/constants/style';
import { VIEWS } from 'code/core/router';

export default class Navbar extends Component {
    constructor() {
        super();

        this.state = {
            expanded: outerWidth >= TABLET_WIDTH && monster.get('sidemenuExpanded') !== 'false'
        };

        this.subscribe('nav:new', 'onContextUpdate');
    }

    // @override
    render() {
        return $('aside',
            { className: classSet('navbar', !this.state.expanded && 'navbar-hidden') },
            $('div', { className: 'navbar-contents' },
                $(Fa, {
                    name: 'chevron-circle-right',
                    className: 'navbar-icon navbar-hide-icon',
                    title: 'Toggle navbar',
                    onClick: ::this.toggleClick,
                    horizontalFlip: this.state.expanded,
                    fixedWidth: true
                }),

                $('button', {
                    className: 'button-primary navbar-button',
                    onClick: ::this.hide
                }, 'Hide Navbar'),

                _.map(VIEWS, (view, index) =>
                    $(SidebarCategory,
                        { key: index, view: view, context: this.state.context }
                    )
                )
            )
        );
    }

    onContextUpdate(context: NavigationContext) {
        this.setState({ context });
    }

    setExpanded(value: boolean) {
        monster.set('sidemenuExpanded', value);
        this.setState({ expanded: value });
    }

    hide() {
        this.setExpanded(false);
    }

    toggleClick() {
        this.setExpanded(!this.state.expanded);
    }
}
