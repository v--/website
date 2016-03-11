const BINARY_INCREMENT = 1024;

const module = {
    humanizeSize(bytes: number): string {
        if (bytes < BINARY_INCREMENT)
            return `${bytes} Bytes`;

        let ratio = bytes / BINARY_INCREMENT;

        for (const size of 'KMGTP') {
            if (ratio < BINARY_INCREMENT / 2)
                return `${ratio.toFixed(2)} ${size}iB`;

            ratio /= BINARY_INCREMENT;
        }

        return 'Invalid size';
    },

    basename(string: string, suffix: string = ''): string {
        let result = string.match(/([^\/]*)(?:\/+)?$/)[1];

        if (result.endsWith(suffix))
            return result.replace(suffix, '');

        return result;
    },

    dirname(string: string): string {
        return string.replace(/(\/+)?[^\/]*(\/+)?$/, '');
    },

    randomInt(min: number, max: number): number {
        return min + Math.round(Math.random() * (max - min));
    },

    swap(object: Object, a: string|number, b: string|number) {
        const tmp = object[a];
        object[a] = object[b];
        object[b] = tmp;
    },

    noop() {},

    noopAsync() {
        return Promise.resolve();
    },

    dumbCopy(source: Object): Object {
        if ('dup' in source)
            return source.dup();

        let result = source instanceof Array ? [] : {};

        for (let key in source) {
            const value = source[key];

            if (value instanceof Object)
                result[key] = module.dumbCopy(value);
            else
                result[key] = value;
        }

        return result;
    },

    identity(value) {
        return value;
    },

    returns(value, transform: Function = module.identity) {
        return () => transform(value);
    },

    returnsAsync(value) {
        return module.returns(value, ::Promise.resolve);
    },

    returnsDumbCopy(value) {
        return module.returns(value, module.dumbCopy);
    },

    constructs(constructor: Function) {
        return (...data) => new constructor(...data);
    },

    functionize(value): Function {
        return value instanceof Function ? value : module.returns(value);
    },

    groupBy(source: Array, prop: string) {
        const result = {};

        for (let item of source) {
            const key = item[prop];

            if (key in result)
                result[key].push(item);
            else
                result[key] = [item];
        }

        return result;
    },

    trim(string: string): string {
        return string.replace(/(^\s+|\s+$)/g, '');
    },

    startsWith(array: Array, subarr: Array): boolean {
        return subarr.every((element, i) => array[i] === element);
    },

    startsWithString(string: string, substr: string): boolean {
        return string.slice(0, substr.length) === substr;
    },

    compactKeys(object: Object): Array {
        let result = [];

        for (let key in object)
            if (object[key])
                result.push(key);

        return result;
    },

    accessor(accessor: ?Function | ?string): Function {
        if (accessor instanceof Function)
            return accessor;

        if (accessor !== undefined)
            return value => value[accessor];

        return module.identity;
    },

    clam(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
};

export default module;
