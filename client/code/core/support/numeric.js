const BINARY_INCREMENT = 1024;

export function humanizeSize(bytes) {
    if (bytes < BINARY_INCREMENT)
        return `${bytes} Bytes`;

    let ratio = bytes / BINARY_INCREMENT;

    for (const size of 'KMGTP') {
        if (ratio < BINARY_INCREMENT / 2)
            return `${ratio.toFixed(2)} ${size}iB`;

        ratio /= BINARY_INCREMENT;
    }

    return 'Invalid size';
}

export function randomInt(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

export function clam(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function isBetween(value, min, max) {
    return value >= min && value <= max;
}

export function extendTo(value, min, max) {
    pre: isBetween(value, 0, 1);
    return min + (max - min) * value;
}

export function pixelize(value) {
    return `${value}px`;
}

export function percentize(value) {
    pre: isBetween(value, 0, 1);
    return `${extendTo(value, 0, 100)}%`;
}

export function modulo(number, modulo) {
    return (number % modulo + modulo) % modulo;
}

export function direction(condition) {
    return condition ? 1 : -1;
}
