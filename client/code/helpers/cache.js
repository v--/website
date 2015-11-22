export default class Cache {
    constructor(timeout: number) {
        this._cleaners = {};
        this._payload = {};
        this.timeout = timeout;
    }

    add(key: string, value) {
        this._payload[key] = value;

        if (key in this._cleaners)
            this._cleaners[key](this.timeout);
        else
            this._cleaners[key] = (::this.remove).partial(key).debounce(this.timeout);
    }

    get(key: string) {
        return this._payload[key];
    }

    has(key: string) {
        const result = key in this._payload;

        if (result)
            this._cleaners[key](this.timeout);

        return result;
    }

    remove(key: string) {
        delete this._payload[key];
        delete this._cleaners[key];
    }
}
