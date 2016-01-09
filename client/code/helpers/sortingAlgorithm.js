class SortResponse {
    constructor(a: number, b: number, swap: boolean) {
        this.merge({ a, b, swap });
    }
}

class Complexity {
    constructor(worst: string) {
        this.merge({ worst });
    }
}

class TimeComplexity extends Complexity {}
class SpaceComplexity extends Complexity {}

export default class SortingAlgorithm {
    static SortResponse = SortResponse;
    static TimeComplexity = TimeComplexity;
    static SpaceComplexity = SpaceComplexity;
    static algorithms = [];

    static save(name: string, time: TimeComplexity, space: SpaceComplexity, generator: Function) {
        SortingAlgorithm.algorithms.push(new SortingAlgorithm(name, time, space, generator));
    }

    constructor(name: string, time: TimeComplexity, space: SpaceComplexity, generator: Function) {
        this.merge({ name, time, space, generator });
    }
}

SortingAlgorithm.save(
    'Insertion sort',
    new TimeComplexity('\\mathcal{O}(n^2)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        for (let i = 1; i < array.length; ++i)
            for (let j = i; j > 0 && array[j - 1] > array[j]; --j)
                yield new SortResponse(j - 1, j, true);
    }
);

SortingAlgorithm.save(
    'Selection sort',
    new TimeComplexity('\\mathcal{O}(n^2)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        for (let i = 0; i < array.length - 1; ++i)
            for (let j = 0; j < array.length - 1; ++j)
                yield new SortResponse(j, j + 1,
                    array.slice(j).min() !== array[j]
                );
    }
);

SortingAlgorithm.save(
    'Bubble sort',
    new TimeComplexity('\\mathcal{O}(n^2)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        let ordered = true;

        for (let i = 1; i < array.length; ++i) {
            let current = array[i - 1] < array[i];
            ordered = ordered && current;

            yield new SortResponse(i - 1, i, !current);

            if (i === array.length - 1 && !ordered) {
                ordered = true;
                i = 0;
            }
        }
    }
);

SortingAlgorithm.save(
    'Shell sort',
    new TimeComplexity('\\mathcal{O}(n \\log n)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        for (let gap of [5, 3, 1]) {
            for (let i = gap; i < array.length; ++i) {
                let temp = array[i], j;

                for (j = i; j >= gap && array[j - gap] > temp; j -= gap)
                    yield new SortResponse(j, j - gap, true);

                yield new SortResponse(j, array.indexOf(temp), true);
            }
        }
    }
);

SortingAlgorithm.save(
    'Merge sort',
    new TimeComplexity('\\mathcal{O}(n \\log n)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        for (let i = 2; i <= array.length * 2; i *= 2)
            for (let j = 0; j < Math.ceil(array.length / i); ++j) {
                let start = i * j,
                    segment = array.slice(start, start + i);

                for (let k = 0; k < segment.length - 1; ++k) {
                    let subsegment = segment.slice(k),
                        min = subsegment.min(),
                        minIndex = segment.indexOf(min),
                        isMin = subsegment[0] === min;

                    if (!isMin)
                        segment.swap(k, minIndex);

                    yield new SortResponse(start + k, start + minIndex, !isMin);
                }
            }
    }
);

SortingAlgorithm.save(
    'Heap sort',
    new TimeComplexity('\\mathcal{O}(n \\log n)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        function heapCheck(heapSize, i) {
            const largest = [i, 2 * i + 1, 2 * i + 2].filter(x => x < heapSize).max(x => array[x]);
            return new SortResponse(i, largest, i !== largest);
        }

        for (let i = Math.floor(array.length / 2); i >= 0; --i) {
            let result = heapCheck(array.length, i);
            yield result;

            while (result.swap) {
                result = heapCheck(array.length, result.b);
                yield result;
            }
        }

        for (let i = array.length - 1; i >= 1; --i) {
            yield new SortResponse(0, i, true);
            let result = heapCheck(i, 0);
            yield result;

            while (result.swap) {
                result = heapCheck(i, result.b);
                yield result;
            }
        }
    }
);

SortingAlgorithm.save(
    'Quicksort',
    new TimeComplexity('\\mathcal{O}(n^2)'),
    new SpaceComplexity('\\mathcal{O}(n)'),

    function *(array) {
        function *partition(lower, upper) {
            const last = array[upper];
            let pivot = lower;

            for (let i = lower; i < upper; ++i)
                if (array[i] <= last)
                    yield new SortResponse(i, pivot++, true);
                else
                    yield new SortResponse(i, pivot, false);

            yield new SortResponse(upper, pivot, true);
        }

        let queue = [[0, array.length - 1]];

        while (queue.length) {
            const config = queue.pop(),
                  lower = config[0],
                  upper = config[1];

            if (lower >= upper)
                continue;

            let pivotIter = partition(lower, upper),
                pivotResponse = pivotIter.next(),
                pivot;

            while (!pivotResponse.done) {
                yield pivotResponse.value;
                pivot = pivotResponse.value.b;
                pivotResponse = pivotIter.next();
            }

            queue.unshift([lower, pivot - 1]);
            queue.unshift([pivot + 1, upper]);
        }
    }
);
