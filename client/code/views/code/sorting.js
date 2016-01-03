import { createElement } from 'react';

import SortDemo from 'code/components/sorting/sortDemo';
import Dispatcher from 'code/helpers/dispatcher';
import SortingAlgorithm from 'code/helpers/sortingAlgorithm';
import viewTemplate from 'views/code/sorting';
import View from 'code/helpers/view';
import Jade from 'code/components/jade';

export default class CodeSorting extends View {
    // @override
    static get title() {
        return 'Sorting';
    }

    // @override
    static get route() {
        return '/code/sorting';
    }

    static get summary() {
        return 'A visual comparison of in-place sorting algorithms.';
    }

    constructor() {
        super();
        this.globalSortDispatcher = new Dispatcher();
    }

    // @override
    render() {
        const
            { globalSortDispatcher } = this,
            { title, summary } = CodeSorting;

        return createElement('div', null,
            createElement(Jade, { template: viewTemplate, data: { title, summary }}),

            createElement('button', {
                onClick: ::this.sortAll,
                className: 'sorting-sortall'
            }, 'Sort all'),

            // TODO: dynamic time scale
            SortingAlgorithm.algorithms.map((algorithm, index) =>
                createElement(SortDemo, { globalSortDispatcher, algorithm, key: index, period: 10 })
            )
        );
    }

    sortAll() {
        this.globalSortDispatcher.dispatch();
    }
}
