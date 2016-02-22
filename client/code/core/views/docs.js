import _ from 'lodash';

import View from 'code/core/helpers/view';
import Table from 'code/core/components/table';
import jsonFetcher from 'code/core/helpers/jsonFetcher';
import Doc from 'code/core/models/doc';
import { $ } from 'code/core/helpers/component';

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
        return jsonFetcher('/api/docs', res => _.map(res, pkg => new Doc(pkg)));
    }

    // @override
    render() {
        return $(Table, {
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
