import _ from 'lodash';

import Queue from 'code/core/helpers/queue';
import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/quick';

export default class QuickSort extends Algorithm {
    /// @override
    static get title() {
        return 'Quicksort (randomized Lomuto partitioning)';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        let queue = new Queue();

        queue.enqueue([0, this.array.length - 1]);

        while (!queue.isEmpty) {
            const config = queue.dequeue(),
                  lower = config[0],
                  upper = config[1],
                  pivotIndex = _.random(lower, upper),
                  pivot = this.array[pivotIndex];

            let p = lower;

            yield new Algorithm.Response(pivotIndex, upper, pivotIndex !== upper);

            for (let i = lower; i < upper; ++i)
                if (this.array[i] < pivot)
                    yield new Algorithm.Response(i, p++, true);
                else
                    yield new Algorithm.Response(i, p, false);

            yield new Algorithm.Response(upper, p, true);

            if (lower < p)
                queue.enqueue([lower, p]);

            if (upper > p + 1)
                queue.enqueue([p + 1, upper]);
        }
    }
}
