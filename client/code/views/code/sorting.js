import ReactSlider from 'react-slider';
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
        return 'A visual comparison of array sorting algorithms.';
    }

    constructor() {
        super();
        this.state = { period: 16 };
        this.globalSortDispatcher = new Dispatcher();
    }

    // @override
    render() {
        const
            { globalSortDispatcher } = this,
            { title, summary } = CodeSorting;

        return createElement('div', null,
            createElement(Jade, { template: viewTemplate, data: { title, summary }}),
            createElement('div', { className: 'sorting-slider-container' },
                createElement('b', { className: 'sorting-slider-label' }, 'Animation speed: '),
                createElement(ReactSlider, {
                    onChange: ::this.updatePeriod,
                    min: 0,
                    max: 7,
                    step: 1,
                    defaultValue: 6,
                    withBars: true,
                    orientation: 'horizontal'
                })
            ),

            createElement('button', {
                onClick: ::this.sortAll,
                className: 'sorting-sortall'
            }, 'Sort all'),

            SortingAlgorithm.algorithms.map((algorithm, index) =>
                createElement(SortDemo, { globalSortDispatcher, algorithm, key: index, period: this.state.period })
            )
        );
    }

    updatePeriod(value: number) {
        this.setState({ period: Math.pow(2, 10 - value) });
    }

    sortAll() {
        this.globalSortDispatcher.dispatch();
    }
}
