import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/bubble';

function sorter(array) {
    let ordered = false;

    while (!ordered) {
        ordered = true;

        for (let i = 1; i < array.length; i++) {
            const current = array[i - 1] <= array[i];
            ordered &= current;
            array.swap(i - 1, i, !current);
        }
    }
}

export default new Algorithm('Bubble sort', template, sorter);
