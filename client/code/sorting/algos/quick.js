import Queue from 'code/core/classes/queue';
import utils from 'code/core/helpers/utils';

import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/quick';

function *generator(array) {
    let queue = new Queue();

    queue.enqueue([0, array.length - 1]);

    while (!queue.isEmpty) {
        const config = queue.dequeue(),
              lower = config[0],
              upper = config[1],
              pivotIndex = utils.randomInt(lower, upper),
              pivot = array[pivotIndex];

        let p = lower;

        yield new Algorithm.Response(pivotIndex, upper, pivotIndex !== upper);

        for (let i = lower; i < upper; ++i)
            if (array[i] < pivot)
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

export default new Algorithm('QuickSort (randomized Lomuto partitioning)', template, generator);
