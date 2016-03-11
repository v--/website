import CoolError from 'code/core/classes/coolError';
import Cache from 'code/core/classes/cache';

const TABLET_WIDTH = 800;

const module = {
    fetchCache: new Cache(10 * 1000),
    injected: new Set(),

    pushState(location: string) {
        if (typeof history !== 'undefined')
            history.pushState({ path: window.location.pathname }, null, location);
        else
            window.location.pathname = location;
    },

    fetch(url: string) {
        return window.fetch(url).then(function (response: Object) {
            if (response.ok)
                return response;

            throw new CoolError.HTTP(response.status, response.statusText);
        });
    },

    fetchJSON(url: string) {
        if (module.fetchCache.has(url))
            return module.fetchCache.get(url);

        const promise = module.fetch(url).then(response => response.json());

        module.fetchCache.add(url, promise);
        return promise;
    },

    injectScript(name: string): Promise {
        if (module.injected.has(name))
            return Promise.resolve();

        return new Promise(function (resolve, reject) {
            const tag = document.createElement('script');
            tag.src = `/code/${name}.js`;
            document.head.appendChild(tag);
            tag.onerror = reject;
            tag.onload = function () {
                module.injected.add(name);
                resolve();
            };
        });
    },

    injectStylesheet(name: string) {
        if (module.injected.has(name))
            return;

        const tag = document.createElement('link');
        tag.rel = 'stylesheet';
        tag.href = `/styles/${name}.css`;
        document.head.appendChild(tag);
    },

    updateWindowTitle(subtitles: string[]) {
        document.title = ['ivasilev.net'].concat(subtitles).join(' :: ');
    },

    inTabletMode(): boolean {
        return window.innerWidth >= TABLET_WIDTH;
    },

    getPath(): string {
        return decodeURI(window.location.pathname);
    },

    on(event: string, callback: Function): Function {
        window.addEventListener(event, callback);
        return module.off.bind(module, event, callback);
    },

    off(event: string, callback: Function) {
        window.removeEventListener(event, callback);
    },

    navigate(path: string) {
        window.location = path;
    },

    documentReadyResolver() {
        if (document.readyState === 'complete')
            return Promise.resolve();

        return new Promise(function(resolve) {
            function listener() {
                unreg();
                resolve();
            }

            const unreg = module.on('DOMContentLoaded', listener);
        });
    }
};

export default module;
