import { createElement } from 'react';

import Table from 'code/components/table';
import View from 'code/helpers/view';
import CodeForex from 'code/views/code/forex';
import CodeSorting from 'code/views/code/sorting';
import CodeBreakout from 'code/views/code/breakout';

export default class Code extends View {
    // @override
    static get title() {
        return 'code';
    }

    // @override
    static get route() {
        return '/code';
    }

    // @override
    static get icon() {
        return 'code';
    }

    // @override
    static get updateOnResize() {
        return true;
    }

    // @override
    static generateHeading() {
        return 'JavaScript/HTML5 experiments';
    }

    // @override
    static subviews() {
        return [
            CodeForex,
            CodeSorting,
            CodeBreakout
        ];
    }

    // @override
    render() {
        return createElement(Table, {
            viewport: this.props.viewport,
            data: this.props.data,
            columns: [{
                name: 'Name',
                width: 3,
                accessors: { value: 'title', hyperlink: 'route' }
            }, {
                name: 'Summary',
                width: 5,
                accessors: { value: 'summary' }
            }]
        });
    }
}
