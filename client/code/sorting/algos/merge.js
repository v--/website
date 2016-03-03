import _ from 'lodash';

import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/merge';
import utils from 'code/core/helpers/utils';

export default class MergeSort extends Algorithm {
    /// @override
    static get title() {
        return 'Merge Sort (bottom-up)';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        // Ensure a bijection
        let unique = _.map(this.array, (x, i) => this.array.length * x + i),
            buffer = new Array(this.array.length);

        for (let span = 1; span < this.array.length; span *= 2)
            for (let start = 0; start < this.array.length; start += 2 * span) {
                const middle = Math.min(start + span, this.array.length),
                      end = Math.min(start + 2 * span, this.array.length);

                let left = start,
                    right = middle;

                for (let i = start; i < end; i++)
                    if (left < middle && (end === right || unique[left] < unique[right]))
                        buffer[i] = unique[left++];
                    else
                        buffer[i] = unique[right++];

                // This function is only relevant because of the nature of the visualization as increases the time complexity
                // A simple this.array copy should be done here
                for (let i = start; i < end; i++) {
                    const index = unique.indexOf(buffer[i]);
                    utils.swap(unique, index, i);
                    yield new Algorithm.Response(i, index, i !== index);
                }
        }
    }
}
