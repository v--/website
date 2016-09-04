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

export function groupBy(source, prop = identity) {
    const result = {};
    const getter = accessor(prop);

    for (const item of source) {
        const key = getter(item);

        if (key in result)
            result[key].push(item);
        else
            result[key] = [item];
    }

    return result;
}

export function mapToObject(source, transform) {
    const result = {};

    for (const item of source) {
        const value = transform(item);
        result[value[0]] = value[1];
    }

    return result;
}

export function startsWith(array, subarr) {
    return subarr.every((element, i) => array[i] === element);
}

export function startsWithString(string, substr) {
    return string.slice(0, substr.length) === substr;
}

export function capitalize(string) {
    if (string.length === 0) return '';
    return string[0].toUpperCase() + string.substr(1);
}

export function repeat(value, goal) {
    return new Array(goal + 1).join(value);
}
