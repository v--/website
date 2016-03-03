export default class Algorithm {
    static Response = class Response {
        constructor(a: number, b: number, swap: boolean) {
            this.a = a;
            this.b = b;
            this.swap = swap;
        }
    }

    static get title() {
        pre: this.constructor !== Algorithm;
    }

    static get template() {
        pre: this.constructor !== Algorithm;
    }

    constructor(array: Array) {
        this.array = array;
        this.iterator = this.createIterator(array);
    }

    next() {
        return this.iterator.next();
    }

    *createIterator() {
        pre: this.constructor !== Algorithm;
    }
}
