import { identity, accessor } from 'code/core/support/functional';

export function basename(string, suffix = '') {
    let result = string.match(/([^\/]*)(?:\/+)?$/)[1];

    if (result.endsWith(suffix))
        return result.replace(suffix, '');

    return result;
}

export function dirname(string) {
    return string.replace(/(\/+)?[^\/]*(\/+)?$/, '');
}

export function last(array) {
    pre: array.length > 0;
    return array[array.length - 1];
}

export function dumbCopy(source) {
    let result = source instanceof Array ? [] : {};

    for (let key in source) {
        const value = source[key];

        if (value instanceof Object && !(value instanceof Function))
            result[key] = dumbCopy(value);
        else
            result[key] = value;
    }

    return result;
}

export function groupBy(source, prop = identity) {
    const result = {};
    const getter = accessor(prop);

    for (let item of source) {
        const key = getter(item);

        if (key in result)
            result[key].push(item);
        else
            result[key] = [item];
    }

    return result;
}

export function startsWith(array, subarr) {
    return subarr.every((element, i) => array[i] === element);
}

export function startsWithString(string, substr) {
    return string.slice(0, substr.length) === substr;
}
