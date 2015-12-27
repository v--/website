import monster from 'cookie-monster';
import { createElement, Component } from 'react';

import Dispatcher from 'code/helpers/dispatcher';
import classSet from 'code/helpers/classSet';
import NavigationContext from 'code/helpers/navigationContext';
import SidebarCategory from 'code/components/navbar/category';
import Fa from 'code/components/fa';
import { TABLET_WIDTH } from 'code/constants/style';
import { VIEWS } from 'code/router';

export default class Navbar extends Component {
    constructor() {
        super();

        this.state = {
            expanded: outerWidth >= TABLET_WIDTH && monster.get('sidemenuExpanded') !== 'false'
        };

        this.unregNavListener = Dispatcher.nav.register(::this.onContextUpdate);
    }

    // @override
    render() {
        return createElement('aside',
            { className: classSet('navbar', !this.state.expanded && 'navbar-hidden') },
            createElement('div', { className: 'navbar-contents' },
                createElement(Fa, {
                    name: 'chevron-circle-right',
                    className: 'navbar-icon navbar-hide-icon',
                    title: 'Toggle navbar',
                    onClick: ::this.toggleClick,
                    horizontalFlip: this.state.expanded,
                    fixedWidth: true
                }),

                createElement('button', {
                    className: 'button-primary navbar-button',
                    onClick: ::this.hide
                }, 'Hide Navbar'),

                VIEWS.map((view, index) =>
                    createElement(SidebarCategory,
                        { key: index, view: view, context: this.state.context }
                    )
                )
            )
        );
    }

    // @override
    componentWillUnmount() {
        this.unregNavListener();
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
