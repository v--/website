import _ from 'lodash';

import Table from 'code/core/components/table';
import View from 'code/core/helpers/view';
import jsonFetcher from 'code/core/helpers/jsonFetcher';
import Slide from 'code/core/models/slide';
import { $ } from 'code/core/helpers/component';

export default class Slides extends View {
        // @override
    static get title() {
        return 'slides';
    }

    // @override
    static get route() {
        return '/slides';
    }

    // @override
    static get icon() {
        return 'line-chart';
    }

    // @override
    static get updateOnResize() {
        return true;
    }

    // @override
    static generateHeading() {
        return 'reveal.js presentations';
    }

    // @override
    static resolver() {
        return jsonFetcher('/api/slides', res => _.map(res, slide => new Slide(slide)));
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
