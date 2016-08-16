import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/shell';

function sorter(array) {
    for (let gap = Math.pow(2, Math.floor(Math.log2(array.length))); gap >= 1; gap /= 2)
        for (let i = gap; i < array.length; i++) {
            let j = i;
            let swappable = i;

            while (j >= gap) {
                const a = j, b = j - gap;
                const swap = array[b] > array[swappable];
                array.swap(a, b, swap);

                if (swap) {
                    if (swappable === b) swappable = a;
                    if (swappable === a) swappable = b;
                } else {
                    break;
                }

                j -= gap;
            }

            array.swap(j, swappable, true);
        }
}

export default new Algorithm('Shell sort', template, sorter);
