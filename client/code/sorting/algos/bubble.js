import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/bubble';

export default class BubbleSort extends Algorithm {
    /// @override
    static get title() {
        return 'Bubble sort';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        let ordered = false;

        while (!ordered) {
            ordered = true;

            for (let i = 1; i < this.array.length; i++) {
                const current = this.array[i - 1] <= this.array[i];
                ordered &= current;
                yield new Algorithm.Response(i - 1, i, !current);
            }
        }
    }
}
