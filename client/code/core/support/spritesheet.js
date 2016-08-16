import { fetch } from 'code/core/support/browser';

const SPRITE_URL = 'images/icons.svg';

let cached = null;
let fetchPromise = null;

export function loadSheet() {
    if (cached !== null)
        return Promise.resolve(cached);

    if (fetchPromise !== null)
        return fetchPromise;

    fetchPromise = fetch(SPRITE_URL)
        .then(response => response.text())
        .then(function (text) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = text;

            const svg = wrapper.querySelector('svg');
            cached = new Map();

            let node = svg.firstChild;

            while (node !== null) {
                let next = node.nextSibling;
                cached.set(node.id, node);
                svg.removeChild(node);
                node = next;
            }

            return cached;
        });

    return fetchPromise;
}

