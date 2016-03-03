import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/selection';

export default class SelectionSort extends Algorithm {
    /// @override
    static get title() {
        return 'Selection sort';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        for (let i = 0; i < this.array.length - 1; i++) {
            let min = i;

            for (let j = i; j < this.array.length; j++) {
                yield new Algorithm.Response(i, j, false);

                if (this.array[j] < this.array[min])
                    min = j;
            }

            yield new Algorithm.Response(min, i, min !== i);
        }
    }
}
