import { last } from 'code/core/support/misc';

function findMinIndex(array) {
    let min = Infinity, minIndex = 0;

    for (const [index, value] of array.entries()) {
        if (value < min) {
            min = value;
            minIndex = index;
        }
    }

    return minIndex;
}

export default class Algorithm {
    static totalOrder(array) {
        const copy = Array.from(array);
        const result = [];

        for (let i = 0; i < copy.length; i++) {
            const minIndex = findMinIndex(copy);
            copy[minIndex] = Infinity;
            result[minIndex] = i;
        }

        return result;
    }

    constructor(name, description, sorter) {
        Object.assign(this, { name, description, sorter });
        Object.freeze(this);
    }

    instantiate(array) {
        const uniq = Algorithm.totalOrder(array);
        const result = [];

        Object.defineProperty(uniq, 'swap', {
            value(a, b, swap) {
                result.push({ a, b, swap });

                if (swap)
                    [ this[a], this[b] ] = [ this[b], this[a] ];

                return last(result);
            }
        });

        this.sorter(uniq);
        return result[Symbol.iterator]();
    }
}
