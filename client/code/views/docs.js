import { createElement } from 'react';

import View from 'code/helpers/view';
import Table from 'code/components/table';
import jsonFetcher from 'code/helpers/jsonFetcher';
import Doc from 'code/models/doc';

export default class Pacman extends View {
        // @override
    static get title() {
        return 'docs';
    }

    // @override
    static get route() {
        return '/docs';
    }

    // @override
    static get icon() {
        return 'file-text-o';
    }

    // @override
    static generateHeading() {
        return 'Hosted documentations';
    }

    // @override
    static resolver() {
        return jsonFetcher('/api/docs', res => res.map(pkg => new Doc(pkg)));
    }

    // @override
    render() {
        return createElement(Table, {
            initialSort: { columnIndex: 0 },
            viewport: this.props.viewport,
            data: this.props.data,
            columns: [{
                name: 'Name',
                accessors: { value: 'name', hyperlink: 'path' }
            }]
        });
    }
}
