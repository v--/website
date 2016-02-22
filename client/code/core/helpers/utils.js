const SIZES = 'KMGTP';
let utils = {};

utils.humanizeSize = function humanizeSize(bytes: number) {
    let ratio = bytes;

    if (bytes < 1024)
        return `${bytes} Bytes`;

    for (const i in SIZES) {
        let lastRatio = ratio;
        ratio /= 1024;

        if (ratio < 0.1)
            return `${Math.round(lastRatio, 2)} ${SIZES[i - 1]}iB`;
    }

    return 'Invalid size';
};

utils.basename = function basename(string: string, suffix: string = '') {
    let result = string.match(/([^\/]*)(?:\/+)?$/)[1];

    if (result.endsWith(suffix))
        return result.replace(suffix, '');

    return result;
};

utils.dirname = function dirname(string: string) {
    return string.replace(/(\/+)?[^\/]*(\/+)?$/, '');
};

utils.swap = function swap(object: Object, a: string|number, b: string|number) {
    const tmp = object[a];
    object[a] = object[b];
    object[b] = tmp;
};

export default utils;
