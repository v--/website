import Queue from 'code/helpers/queue';

class SortResponse {
    constructor(a: number, b: number, swap: boolean) {
        this.merge({ a, b, swap });
    }
}

export default class SortingAlgorithm {
    static SortResponse = SortResponse;
    static algorithms = [];

    static save(name: string, stable: boolean, time: string, space: string, generator: Function) {
        const algorithm = new SortingAlgorithm(name, stable, time, space, generator);
        SortingAlgorithm.algorithms.push(algorithm);
    }

    constructor(name: string, stable: boolean, time: string, space: string, generator: Function) {
        this.merge({ name, stable, time, space, generator });
    }
}

SortingAlgorithm.save(
    'Insertion sort', true, '\\mathcal{O}(n^2)', '\\Theta(1)',

    function *(array) {
        for (let i = 1; i < array.length; i++)
            for (let j = i; j > 0; --j)
                yield new SortResponse(j - 1, j, array[j - 1] > array[j]);
    }
);

SortingAlgorithm.save(
    'Selection sort', false, '\\Theta(n^2)', '\\Theta(1)',

    function *(array) {
        for (let i = 0; i < array.length - 1; i++) {
            let min = i;

            for (let j = i; j < array.length; j++) {
                yield new SortResponse(i, j, false);

                if (array[j] < array[min])
                    min = j;
            }

            yield new SortResponse(min, i, min !== i);
        }
    }
);

SortingAlgorithm.save(
    'Bubble sort', true, '\\mathcal{O}(n^2)', '\\Theta(1)',

    function *(array) {
        let ordered = false;

        while (!ordered) {
            ordered = true;

            for (let i = 1; i < array.length; i++) {
                const current = array[i - 1] <= array[i];
                ordered &= current;
                yield new SortResponse(i - 1, i, !current);
            }
        }
    }
);

SortingAlgorithm.save(
    'Shell sort', false, '\\mathcal{O}(n^2)', '\\Theta(1)',

    function *(array) {
        for (let gap = Math.pow(2, array.length.log(2).floor()); gap >= 1; gap /= 2)
            for (let i = gap; i < array.length; i++) {
                let j = i,
                    swappable = i;

                while (j >= gap) {
                    const result = new SortResponse(j, j - gap, array[j - gap] > array[swappable]);
                    yield result;

                    if (result.swap) {
                        if (swappable === result.b) swappable = result.a;
                        if (swappable === result.a) swappable = result.b;
                    } else {
                        break;
                    }

                    j -= gap;
                }

                yield new SortResponse(j, swappable, true);
            }
    }
);

SortingAlgorithm.save(
    'Merge sort (bottom-up)', true, '\\mathcal{O}(n \\log n)', '\\mathcal{O}(n)',

    function *(array) {
        // To ensure a bijection for the lookup table
        let buffer = new Array(array.length),
            unique = array.map((x, i) => array.length * x + i),
            lookup = Object.zip(unique, unique.map((x, i) => i));

        for (let span = 1; span <= array.length; span *= 2)
            for (let start = 0; start < array.length; start += 2 * span) {
                const middle = Math.min(start + span, array.length),
                      end = Math.min(start + 2 * span, array.length);

                let left = start,
                    right = middle;

                for (let i = start; i < end; i++)
                    if (left < middle && (end === right || unique[left] < unique[right]))
                        buffer[i] = unique[left++];
                    else
                        buffer[i] = unique[right++];

                for (let i = start; i < end; i++) {
                    const index = lookup[buffer[i]];
                    lookup.swap(buffer[i], buffer[index]);
                    unique.swap(i, index);
                    lookup = Object.zip(unique, unique.map((x, i) => i));
                    yield new SortResponse(i, index, i !== index);
                }
        }
    }
);

SortingAlgorithm.save(
    'Heap sort', false, '\\mathcal{O}(n \\log n)', '\\Theta(1)',

    function *(array) {
        function heapCheck(heapSize, i) {
            const largest = [i, 2 * i + 1, 2 * i + 2].filter(x => x < heapSize).max(x => array[x]);
            return new SortResponse(i, largest, i !== largest);
        }

        for (let i = Math.floor(array.length / 2); i >= 0; --i) {
            let result = heapCheck(array.length, i);
            yield result;

            while (result.swap)
                yield result = heapCheck(array.length, result.b);
        }

        for (let i = array.length - 1; i >= 1; --i) {
            yield new SortResponse(0, i, true);
            let result = heapCheck(i, 0);
            yield result;

            while (result.swap)
                yield result = heapCheck(i, result.b);
        }
    }
);

SortingAlgorithm.save(
    'Quicksort (Hoare partitioning)', false, '\\mathcal{O}(n^2)', '\\mathcal{O}(n)',

    function *(array) {
        let queue = new Queue();

        queue.push([0, array.length - 1]);

        while (!queue.isEmpty) {
            const config = queue.pop(),
                  lower = config[0],
                  upper = config[1];

            if (lower >= upper)
                continue;

            const pivot = array[lower];
            let i = lower - 1,
                p = upper + 1;

            while (i < p) {
                do i++; while (array[i] < pivot);
                do p--; while (array[p] > pivot);
                yield new SortResponse(i, p, i < p);
            }

            queue.push([lower, p]);
            queue.push([p + 1, upper]);
        }
    }
);
