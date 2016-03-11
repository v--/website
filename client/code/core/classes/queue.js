export default class Queue {
    get isEmpty() {
        return this._front === null;
    }

    get peek() {
        if (this.isEmpty) throw new Error('Queue is empty');
        return this._front.value;
    }

    constructor() {
        this._front = this._back = null;
    }

    enqueue(value) {
        const next = {
            next: null,
            value: value
        };

        if (this._back !== null)
            this._back.next = next;

        this._back = next;

        if (this._front === null)
            this._front = this._back;
    }

    dequeue() {
        if (this.isEmpty) throw new Error('Queue is empty');

        const value = this.peek,
              old = { payload: this._front };

        this._front = old.payload.next;

        if (this._front === null)
            this._back = null;

        delete old.payload;
        return value;
    }
}
