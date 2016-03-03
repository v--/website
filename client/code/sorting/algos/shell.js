import Algorithm from 'code/sorting/helpers/algorithm';
import template from 'views/sorting/algos/shell';

export default class ShellSort extends Algorithm {
    /// @override
    static get title() {
        return 'Shell sort';
    }

    /// @override
    static get template() {
        return template;
    }

    /// @override
    *createIterator() {
        for (let gap = Math.pow(2, Math.floor(Math.log2(this.array.length))); gap >= 1; gap /= 2)
            for (let i = gap; i < this.array.length; i++) {
                let j = i,
                    swappable = i;

                while (j >= gap) {
                    const result = new Algorithm.Response(j, j - gap, this.array[j - gap] > this.array[swappable]);
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
}
