class SortResponse {
    constructor(a: number, b: number, swap: boolean) {
        this.merge({ a, b, swap });
    }
}

export default class SortingAlgorithm {
    static SortResponse = SortResponse;
    static algorithms = [];

    static save(name: string, generator: Function) {
        SortingAlgorithm.algorithms.push(new SortingAlgorithm(name, generator));
    }

    // replace constraint with GeneratorFunction
    constructor(name: string, generator: Function) {
        this.merge({ name, generator });
    }
}

SortingAlgorithm.save(
    'Insertion sort',

    function *(array) {
        for (let i = 1; i < array.length; ++i)
            for (let j = i; j > 0 && array[j - 1] > array[j]; --j)
                yield new SortResponse(j - 1, j, true);
    }
);

SortingAlgorithm.save(
    'Selection sort',

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

                    yield new SortResponse(start + k, start + minIndex, isMin);
                }
            }
    }
);
