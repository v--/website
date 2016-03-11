export default class Cache {
    constructor(timeout: number) {
        this.cleaners = new Map();
        this.payload = new Map();
        this.timeout = timeout;
    }

    add(key: string, value: any) {
        this.payload.set(key, value);
        this.resetTimer(key);
    }

    get(key: string) {
        return this.payload.get(key);
    }

    has(key: string) {
        return this.payload.has(key);
    }

    remove(key: string) {
        this.payload.delete(key);
        this.cleaners.delete(key);
    }

    resetTimer(key: string) {
        if (this.cleaners.has(key))
            clearTimeout(this.cleaners.get(key));

        this.cleaners.set(key, setTimeout(() => this.remove(key), this.timeout));
    }
}
