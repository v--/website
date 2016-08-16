import { randomInt } from 'code/core/support/numeric';

import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/quick';

function sorter(array) {
    function partition(lower, upper) {
        const pivotIndex = randomInt(lower, upper);
        const pivot = array[pivotIndex];
        let p = lower;

        array.swap(pivotIndex, upper, pivotIndex !== upper);

        for (let i = lower; i < upper; i++)
            if (array[i] < pivot)
                array.swap(i, p++, true);
            else
                array.swap(i, p, false);

        return array.swap(p, upper, true).a;
    }

    function quicksort(lower, upper) {
        const pivotIndex = partition(lower, upper);

        if (lower < pivotIndex)
            quicksort(lower, pivotIndex);

        if (upper > pivotIndex + 1)
            quicksort(pivotIndex + 1, upper);
    }

    quicksort(0, array.length - 1);
}

export default new Algorithm('QuickSort (randomized Lomuto partitioning)', template, sorter);
