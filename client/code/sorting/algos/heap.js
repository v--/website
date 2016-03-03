import _ from 'lodash';

import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/heap';

export default class HeapSort extends Algorithm {
    /// @override
    static get title() {
        return 'Heap sort';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        for (let i = Math.floor(this.array.length / 2); i >= 0; --i) {
            let result = this.heapCheck(this.array.length, i);
            yield result;

            while (result.swap)
                yield result = this.heapCheck(this.array.length, result.b);
        }

        for (let i = this.array.length - 1; i >= 1; --i) {
            yield new Algorithm.Response(0, i, true);
            let result = this.heapCheck(i, 0);
            yield result;

            while (result.swap)
                yield result = this.heapCheck(i, result.b);
        }
    }

    heapCheck(heapSize, i) {
        const largest = _([i, 2 * i + 1, 2 * i + 2]).filter(x => x < heapSize).maxBy(x => this.array[x]);
        return new Algorithm.Response(i, largest, i !== largest);
    }
}
