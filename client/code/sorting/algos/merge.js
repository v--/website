import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/merge';
import utils from 'code/core/helpers/utils';

function *generator(array) {
    // Ensure a bijection
    let unique = array.map((x, i) => array.length * x + i),
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
                yield new Algorithm.Response(i, index, i !== index);
            }
    }
}

export default new Algorithm('Merge sort (bottom-up)', template, generator);
