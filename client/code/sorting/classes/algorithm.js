export default class Algorithm {
    static Response = class Response {
        constructor(a: number, b: number, swap: boolean) {
            this.a = a;
            this.b = b;
            this.swap = swap;
        }
    }

    constructor(name: string, description: string, generator: Function) {
        this.name = name;
        this.description = description;
        this.generator = generator;
        Object.freeze(this);
    }
}
