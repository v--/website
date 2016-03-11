import Algorithm from 'code/sorting/classes/algorithm';
import template from 'views/sorting/algos/heap';

function *generator(array) {
    function heapCheck(heapSize, i) {
        const largest = [i, 2 * i + 1, 2 * i + 2]
            .filter(x => x < heapSize)
            .reduce((x, payload) => array[x] >= array[payload] ? x : payload); // Max by array[x]

        return new Algorithm.Response(i, largest, i !== largest);
    }

    for (let i = Math.floor(array.length / 2); i >= 0; --i) {
        let result = heapCheck(array.length, i);
        yield result;

        while (result.swap)
            yield result = heapCheck(array.length, result.b);
    }

    for (let i = array.length - 1; i >= 1; --i) {
        yield new Algorithm.Response(0, i, true);
        let result = heapCheck(i, 0);
        yield result;

        while (result.swap)
            yield result = heapCheck(i, result.b);
    }
}

export default new Algorithm('Heap sort', template, generator);
