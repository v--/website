import { repeat } from 'code/core/support/misc';

const cow = `
        o   ^__^
         o  (oo)\_______
            (__)\       )\/\\
                ||----w |
                ||     ||
`;

export default function cowthink(message) {
    const lineLength = message.length + 2; // The 2 is for padding
    return ` ${repeat('_', lineLength)}\n( ${message} )\n ${repeat('-', lineLength)}${cow}`;
}
