import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/selection';

function *generator(array) {
    for (let i = 0; i < array.length - 1; i++) {
        let min = i;

        for (let j = i; j < array.length; j++) {
            yield new Algorithm.Response(i, j, false);

            if (array[j] < array[min])
                min = j;
        }

        yield new Algorithm.Response(min, i, min !== i);
    }
}

export default new Algorithm('Selection sort', template, generator);
