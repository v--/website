import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/merge';

function sorter(array) {
    const buffer = [];

    for (let span = 1; span < array.length; span *= 2)
        for (let start = 0; start < array.length; start += 2 * span) {
            const middle = Math.min(start + span, array.length),
                  end = Math.min(start + 2 * span, array.length);

            let left = start,
                right = middle;

            for (let i = start; i < end; i++)
                if (left < middle && (end === right || array[left] < array[right]))
                    buffer[i] = array[left++];
                else
                    buffer[i] = array[right++];

            for (let i = start; i < end; i++) {
                const index = array.indexOf(buffer[i]);
                array.swap(index, i, i !== index);
            }
    }
}

export default new Algorithm('Merge sort (bottom-up)', template, sorter);
