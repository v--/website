import _ from 'lodash';

import mediator from 'code/core/helpers/mediator';
import Katex from 'code/core/components/katex';
import Algorithm from 'code/sorting/helpers/algorithm';
import Sorter from 'code/sorting/components/sorter';
import { Component, props, $ } from 'code/core/helpers/component';

export default class Demo extends Component {
    static propTypes = {
        period: props.number.isRequired,
        algorithm: props.instanceOf(Algorithm).isRequired
    };

    static ORDERED =  [1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    static SHUFFLED = [13, 4,  3,  19, 6,  15, 9,  22, 16, 21, 12, 8,  7,  24, 18, 2,  25, 1,  23, 5,  14, 17, 20, 10, 11];
    static REVERSED = [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9,  8,  7,  6,  5,  4,  3,  2,  1];
    static GROUPPED = [25, 20, 10, 15, 25, 25, 5,  5,  5,  20, 10, 5,  15, 20, 15, 25, 15, 20, 25, 10, 15, 10, 5, 20, 10];

    // @override
    constructor() {
        super();
        this.id = Demo.count = Demo.count + 1 || 0;
        this.subscribe('sorting:all', 'sort');
    }

    // @override
    render() {
        const common = {
            parentId: this.id,
            period: this.props.period,
            generator: this.props.algorithm.generator
        };

        return $('div', { className: 'sort-demo-container' },
            $('div', { className: 'sort-demo' },
                $('div', { className: 'sort-demo-section' },
                    $('p', { className: 'sort-demo-title' }, this.props.algorithm.name),
                ),

                $('div', { className: 'sort-demo-section' },
                    $(Sorter, _.merge({ name: 'Ordered', array: Demo.ORDERED }, common)),
                    $(Sorter, _.merge({ name: 'Shuffled', array: Demo.SHUFFLED }, common)),
                    $(Sorter, _.merge({ name: 'Reversed', array: Demo.REVERSED }, common)),
                    $(Sorter, _.merge({ name: 'Groupped', array: Demo.GROUPPED }, common))
                ),

                $('div', { className: 'sort-demo-section' },
                    $('div', { className: 'sort-demo-subsection' },
                        $('p', { className: 'sort-demo-heading' }, 'Stable:'),
                        $('p', null, this.props.algorithm.stable ? 'True' : 'False')
                    ),

                    $('div', { className: 'sort-demo-subsection' },
                        $('p', { className: 'sort-demo-heading' }, 'Time complexity:'),
                        $(Katex, { string: this.props.algorithm.time }),
                    ),

                    $('div', { className: 'sort-demo-subsection' },
                        $('p', { className: 'sort-demo-heading' }, 'Space complexity:'),
                        $(Katex, { string: this.props.algorithm.space }),
                    )
                ),

                $('div', { className: 'sort-demo-section' },
                    $('button', { onClick: ::this.sort }, 'Sort')
                )
            )
        );
    }

    sort() {
        mediator.emit('sorting:sort', this.id);
    }
}
