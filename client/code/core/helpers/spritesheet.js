import { SPRITE_URL } from 'code/core/constants/misc';
import browser from 'code/core/helpers/browser';

const module = {
    cached: null,
    fetchPromise: null,

    fetch() {
        if (module.cached !== null)
            return Promise.resolve(module.cached);

        if (module.fetchPromise !== null)
            return module.fetchPromise;

        module.fetchPromise = browser.fetch(SPRITE_URL)
            .then(response => response.text())
            .then(function (text) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = text;

                const svg = wrapper.querySelector('svg');
                module.cached = new Map();

                let node = svg.firstChild;

                while (node !== null) {
                    let next = node.nextSibling;
                    module.cached.set(node.id, node);
                    svg.removeChild(node);
                    node = next;
                }

                return module.cached;
            });

        return module.fetchPromise;
    }
};

export default module;
