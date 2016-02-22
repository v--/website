import _ from 'lodash';

let cache = {};

export default function injectBundles(...names) {
    return Promise.all(_.map(names, function (name) {
        if (name in cache) {
            return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
            const tag = document.createElement('script');
            tag.src = `/code/${name}.js`;
            document.body.insertBefore(tag, document.body.querySelector('script'));
            tag.onerror = reject;
            tag.onload = function () {
                cache[name] = true;
                resolve();
            };
        });
    }));
}
