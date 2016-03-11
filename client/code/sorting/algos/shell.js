import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/shell';

function *generator(array) {
    for (let gap = Math.pow(2, Math.floor(Math.log2(array.length))); gap >= 1; gap /= 2)
        for (let i = gap; i < array.length; i++) {
            let j = i,
                swappable = i;

            while (j >= gap) {
                const result = new Algorithm.Response(j, j - gap, array[j - gap] > array[swappable]);
                yield result;

                if (result.swap) {
                    if (swappable === result.b) swappable = result.a;
                    if (swappable === result.a) swappable = result.b;
                } else {
                    break;
                }

                j -= gap;
            }

            yield new Algorithm.Response(j, swappable, true);
        }
}

export default new Algorithm('Shell sort', template, generator);
