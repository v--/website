import CoolError from 'code/core/classes/cool_error';
import Cache from 'code/core/classes/cache';

const TABLET_WIDTH = 800;
const fetchCache = new Cache(10 * 1000);
const injected = new Set();

export function pushState(location) {
    if (typeof history !== 'undefined')
        history.pushState({ path: window.location.pathname }, null, location);
    else
        window.location.pathname = location;
}

export function fetch(url) {
    return window.fetch(url).then(function (response) {
        if (response.ok)
            return response;

        throw new CoolError.HTTP(response.status, response.statusText);
    });
}

export function fetchJSON(url) {
    if (fetchCache.has(url))
        return fetchCache.get(url);

    const promise = fetch(url).then(response => response.json());

    fetchCache.add(url, promise);
    return promise;
}

export function injectScript(name) {
    if (injected.has(name))
        return Promise.resolve(window.modules[name]);

    return new Promise(function (resolve, reject) {
        const tag = document.createElement('script');
        tag.src = `/code/${name}.js`;
        document.head.appendChild(tag);
        tag.onerror = reject;
        tag.onload = function () {
            injected.add(name);
            resolve(window.modules[name]);
        };
    });
}

export function injectStylesheet(name) {
    if (injected.has(name))
        return;

    const tag = document.createElement('link');
    tag.rel = 'stylesheet';
    tag.href = `/styles/${name}.css`;
    document.head.appendChild(tag);
}

export function updateWindowTitle(subtitles) {
    document.title = ['ivasilev.net'].concat(subtitles).join(' :: ');
}

export function inGridtMode() {
    return window.innerWidth >= TABLET_WIDTH;
}

export function getPath() {
    return decodeURI(window.location.pathname);
}

export function on(event, callback) {
    window.addEventListener(event, callback);
    return off.bind(null, event, callback);
}

export function off(event, callback) {
    window.removeEventListener(event, callback);
}

export function navigate(path) {
    window.location = path;
}

export function documentReadyResolver() {
    if (document.readyState === 'complete')
        return Promise.resolve();

    return new Promise(function(resolve) {
        function listener() {
            unreg();
            resolve();
        }

        const unreg = on('DOMContentLoaded', listener);
    });
}
