const SIZES = 'KMGTP';

export default function humanizeSize(bytes: number) {
    let ratio = bytes;

    if (bytes < 1024)
        return `${bytes} Bytes`;

    for (const i in SIZES) {
        let lastRatio = ratio;
        ratio /= 1024;

        if (ratio < 0.1)
            return `${lastRatio.round(2)} ${SIZES[i - 1]}iB`;
    }

    return 'Invalid size';
}
