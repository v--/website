import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/gnome';

function sorter(array) {
    for (let pos = 0; pos < array.length; ) {
        const swap = pos !== 0 && array[pos - 1] > array[pos];
        array.swap(Math.max(0, pos - 1), pos, swap);

        if (swap)
            pos--;
        else
            pos++;
    }
}

export default new Algorithm('Gnome sort', template, sorter);
