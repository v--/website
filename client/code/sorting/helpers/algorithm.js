import _ from 'lodash';

import utils from 'code/core/helpers/utils';
import Queue from 'code/core/helpers/queue';

class SortResponse {
    constructor(a: number, b: number, swap: boolean) {
        _.merge(this, { a, b, swap });
    }
}

export default class SortingAlgorithm {
    static SortResponse = SortResponse;
    static algorithms = [];

    static save(name: string, stable: boolean, time: string, space: string, generator: Function) {
        const algorithm = new SortingAlgorithm(name, stable, time, space, generator);
        SortingAlgorithm.algorithms.push(algorithm);
    }

    constructor(name: string, stable: boolean, time: string, space: string, generator: Function) {
        _.merge(this, { name, stable, time, space, generator });
    }
}

SortingAlgorithm.save(
    'Insertion sort', true, '\\mathcal{O}(n^2)', '\\Theta(1)',

    function *(array) {
        for (let i = 1; i < array.length; i++)
            for (let j = i; j > 0; --j)
                yield new SortResponse(j - 1, j, array[j - 1] > array[j]);
    }
);

SortingAlgorithm.save(
    'Selection sort', false, '\\Theta(n^2)', '\\Theta(1)',

    function *(array) {
        for (let i = 0; i < array.length - 1; i++) {
            let min = i;

            for (let j = i; j < array.length; j++) {
                yield new SortResponse(i, j, false);

                if (array[j] < array[min])
                    min = j;
            }

            yield new SortResponse(min, i, min !== i);
        }
    }
);

SortingAlgorithm.save(
    'Bubble sort', true, '\\mathcal{O}(n^2)', '\\Theta(1)',

    function *(array) {
        let ordered = false;

        while (!ordered) {
            ordered = true;

            for (let i = 1; i < array.length; i++) {
                const current = array[i - 1] <= array[i];
                ordered &= current;
                yield new SortResponse(i - 1, i, !current);
            }
        }
    }
);

SortingAlgorithm.save(
    'Shell sort', false, '\\mathcal{O}(n^2)', '\\Theta(1)',

    function *(array) {
        for (let gap = Math.pow(2, Math.floor(Math.log2(array.length))); gap >= 1; gap /= 2)
            for (let i = gap; i < array.length; i++) {
                let j = i,
                    swappable = i;

                while (j >= gap) {
                    const result = new SortResponse(j, j - gap, array[j - gap] > array[swappable]);
                    yield result;

                    if (result.swap) {
                        if (swappable === result.b) swappable = result.a;
                        if (swappable === result.a) swappable = result.b;
                    } else {
                        break;
                    }

                    j -= gap;
                }

                yield new SortResponse(j, swappable, true);
            }
    }
);

SortingAlgorithm.save(
    'Merge sort (bottom-up)', true, '\\mathcal{O}(n \\log n)', '\\mathcal{O}(n)',

    function *(array) {
        // To ensure a bijection
        let unique = _.map(array, (x, i) => array.length * x + i),
            buffer = new Array(array.length);

        for (let span = 1; span < array.length; span *= 2)
            for (let start = 0; start < array.length; start += 2 * span) {
                const middle = Math.min(start + span, array.length),
                      end = Math.min(start + 2 * span, array.length);

                let left = start,
                    right = middle;

                for (let i = start; i < end; i++)
                    if (left < middle && (end === right || unique[left] < unique[right]))
                        buffer[i] = unique[left++];
                    else
                        buffer[i] = unique[right++];

                // This function is only relevant because of the nature of the visualization as increases the time complexity
                // A simple array copy should be done here
                for (let i = start; i < end; i++) {
                    const index = unique.indexOf(buffer[i]);
                    utils.swap(unique, index, i);
                    yield new SortResponse(i, index, i !== index);
                }
        }
    }
);

SortingAlgorithm.save(
    'Heap sort', false, '\\mathcal{O}(n \\log n)', '\\Theta(1)',

    function *(array) {
        function heapCheck(heapSize, i) {
            const largest = _([i, 2 * i + 1, 2 * i + 2]).filter(x => x < heapSize).maxBy(x => array[x]);
            return new SortResponse(i, largest, i !== largest);
        }

        for (let i = Math.floor(array.length / 2); i >= 0; --i) {
            let result = heapCheck(array.length, i);
            yield result;

            while (result.swap)
                yield result = heapCheck(array.length, result.b);
        }

        for (let i = array.length - 1; i >= 1; --i) {
            yield new SortResponse(0, i, true);
            let result = heapCheck(i, 0);
            yield result;

            while (result.swap)
                yield result = heapCheck(i, result.b);
        }
    }
);

SortingAlgorithm.save(
    'Quicksort (randomized Lomuto partitioning)', false, '\\mathcal{O}(n^2)', '\\mathcal{O}(n)',

    function *(array) {
        let queue = new Queue();

        queue.enqueue([0, array.length - 1]);

        while (!queue.isEmpty) {
            const config = queue.dequeue(),
                  lower = config[0],
                  upper = config[1],
                  pivotIndex = _.random(lower, upper),
                  pivot = array[pivotIndex];

            let p = lower;

            yield new SortResponse(pivotIndex, upper, pivotIndex !== upper);

            for (let i = lower; i < upper; ++i)
                if (array[i] < pivot)
                    yield new SortResponse(i, p++, true);
                else
                    yield new SortResponse(i, p, false);

            yield new SortResponse(upper, p, true);

            if (lower < p)
                queue.enqueue([lower, p]);

            if (upper > p + 1)
                queue.enqueue([p + 1, upper]);
        }
    }
);
