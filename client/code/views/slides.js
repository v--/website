import { createElement } from 'react';

import Table from 'code/components/table';
import View from 'code/helpers/view';
import jsonFetcher from 'code/helpers/jsonFetcher';
import Slide from 'code/models/slide';

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
        return jsonFetcher('/api/slides', res => res.map(slide => new Slide(slide)));
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
