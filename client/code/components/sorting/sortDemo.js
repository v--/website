import { createElement, Component, PropTypes } from 'react';

import Dispatcher from 'code/helpers/dispatcher';
import SortingAlgorithm from 'code/helpers/sortingAlgorithm';
import SortDemoSorter from 'code/components/sorting/sortDemoSorter';
import Katex from 'code/components/katex';

export default class SortDemo extends Component {
    static propTypes = {
        period: PropTypes.number.isRequired,
        algorithm: PropTypes.instanceOf(SortingAlgorithm).isRequired,
        globalSortDispatcher: PropTypes.instanceOf(Dispatcher).isRequired
    }

    /* eslint max-len: 2, no-multi-spaces: 2 */
    static ORDERED =  [1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    static SHUFFLED = [13, 4,  3,  19, 6,  15, 9,  22, 16, 21, 12, 8,  7,  24, 18, 2,  25, 1,  23, 5,  14, 17, 20, 10, 11];
    static REVERSED = [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9,  8,  7,  6,  5,  4,  3,  2,  1];
    static GROUPPED = [25, 20, 10, 15, 25, 25, 5,  5,  5,  20, 10, 5,  15, 20, 15, 25, 15, 20, 25, 10, 15, 10, 5, 20, 10];
    /* eslint max-len: 0, no-multi-spaces: 0 */

    constructor() {
        super();
        this.sortDispatcher = new Dispatcher();
    }

    // @override
    render() {
        const common = {
            period: this.props.period,
            sortDispatcher: this.sortDispatcher,
            generator: this.props.algorithm.generator
        };

        return createElement('div', { className: 'sort-demo-container' },
            createElement('div', { className: 'sort-demo' },
                createElement('div', { className: 'sort-demo-section' },
                    createElement('p', { className: 'sort-demo-title' }, this.props.algorithm.name),
                ),

                createElement('div', { className: 'sort-demo-section' },
                    createElement(SortDemoSorter, { name: 'Ordered', array: SortDemo.ORDERED }.merge(common)),
                    createElement(SortDemoSorter, { name: 'Shuffled', array: SortDemo.SHUFFLED }.merge(common)),
                    createElement(SortDemoSorter, { name: 'Reversed', array: SortDemo.REVERSED }.merge(common)),
                    createElement(SortDemoSorter, { name: 'Groupped', array: SortDemo.GROUPPED }.merge(common))
                ),

                createElement('div', { className: 'sort-demo-section' },
                    createElement('div', { className: 'sort-demo-subsection' },
                        createElement('p', { className: 'sort-demo-heading' }, 'Stable:'),
                        createElement('p', null, this.props.algorithm.stable ? 'True' : 'False')
                    ),

                    createElement('div', { className: 'sort-demo-subsection' },
                        createElement('p', { className: 'sort-demo-heading' }, 'Time complexity:'),
                        createElement(Katex, { string: this.props.algorithm.time }),
                    ),

                    createElement('div', { className: 'sort-demo-subsection' },
                        createElement('p', { className: 'sort-demo-heading' }, 'Space complexity:'),
                        createElement(Katex, { string: this.props.algorithm.space }),
                    )
                ),

                createElement('div', { className: 'sort-demo-section' },
                    createElement('button', { onClick: ::this.sort }, 'Sort')
                )
            )
        );
    }

    // @override
    componentWillMount() {
        this.unregGlobalSort = this.props.globalSortDispatcher.register(::this.sort);
    }

    // @override
    componentWillUnmount() {
        this.unregGlobalSort();
    }

    // @override
    componentWillReceiveProps(props: Object) {
        this.unregGlobalSort();
        this.unregGlobalSort = props.globalSortDispatcher.register(::this.sort);
    }

    sort() {
        this.sortDispatcher.dispatch();
    }
}
