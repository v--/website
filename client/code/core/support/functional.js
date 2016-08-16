export function noop() {}

export function noopAsync() {
    return Promise.resolve();
}

export function identity(value) {
    return value;
}

export function factorize(value, transform = identity) {
    return () => transform(value);
}

export function asyncFactorize(value) {
    return factorize(value, ::Promise.resolve);
}

export function constructs(constructor) {
    return (...data) => new constructor(...data);
}

export function functionize(value) {
    return value instanceof Function ? value : factorize(value);
}

export function accessor(accessor) {
    if (accessor instanceof Function)
        return accessor;

    if (accessor !== undefined)
        return value => value[accessor];

    return identity;
}
