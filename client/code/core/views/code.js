import { $ } from 'code/core/helpers/component';

import Table from 'code/core/components/table';
import View from 'code/core/helpers/view';

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
        return 'JS + HTML5 playground';
    }

    // @override
    static subviews() {
        return [
            View.generate('FOREX', '/code/forex', 'A comparison of FOREX market models.'),
            View.generate('Sorting', '/code/sorting', 'A visual comparison of array sorting algorithms.'),
            View.generate('Breakout', '/code/breakout', 'A randomly-generated Breakout game clone.')
        ];
    }

    // @override
    render() {
        return $(Table, {
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
