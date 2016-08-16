import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/selection';

function sorter(array) {
    for (let i = 0; i < array.length - 1; i++) {
        let min = i;

        for (let j = i; j < array.length; j++) {
            array.swap(i, j, false);

            if (array[j] < array[min])
                min = j;
        }

        array.swap(min, i, min !== i);
    }
}

export default new Algorithm('Selection sort', template, sorter);
