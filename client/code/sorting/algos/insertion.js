import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/insertion';

function sorter(array) {
    for (let i = 1; i < array.length; i++)
        for (let j = i; j > 0; --j)
            array.swap(j - 1, j, array[j - 1] > array[j]);
}

export default new Algorithm('Insertion sort', template, sorter);
