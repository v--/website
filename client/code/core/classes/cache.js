export default class Cache {
    constructor(timeout) {
        this.cleaners = new Map();
        this.payload = new Map();
        this.timeout = timeout;
    }

    add(key, value) {
        this.payload.set(key, value);
        this.resetTimer(key);
    }

    get(key) {
        return this.payload.get(key);
    }

    has(key) {
        return this.payload.has(key);
    }

    remove(key) {
        this.payload.delete(key);
        this.cleaners.delete(key);
    }

    resetTimer(key) {
        if (this.cleaners.has(key))
            clearTimeout(this.cleaners.get(key));

        this.cleaners.set(key, setTimeout(() => this.remove(key), this.timeout));
    }
}
