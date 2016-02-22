import HTTPError from 'code/core/helpers/httpError';
import Cache from 'code/core/helpers/cache';

const cache = new Cache(10 * 1000);

export default function jsonFetcher(url: string, parser: Function = Function.identity) {
    if (cache.has(url))
        return Promise.resolve(cache.get(url));

    return fetch(url).then(function (response: Object) {
        if (response.ok)
            return response.json();

        throw new HTTPError(response.status, response.statusText);
    }).then(parser).then(function (parsed) {
        cache.add(url, parsed);
        return parsed;
    });
}
