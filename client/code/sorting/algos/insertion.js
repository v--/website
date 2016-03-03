import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/insertion';

export default class InsertionSort extends Algorithm {
    /// @override
    static get title() {
        return 'Insertion sort';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        for (let i = 1; i < this.array.length; i++)
            for (let j = i; j > 0; --j)
                yield new Algorithm.Response(j - 1, j, this.array[j - 1] > this.array[j]);
    }
}
