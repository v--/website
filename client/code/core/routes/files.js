import Route from 'code/core/classes/route';
import { fetchJSON } from 'code/core/support/browser';
import { basename } from 'code/core/support/misc';

export default new Route({
    name: 'files',
    path: '/files',

    children () {
        return fetchJSON('/api/files').then(function (data) {
            return data.children
                .filter(child => child.isDirectory)
                .map(child => new Route({
                    name: basename(child.path),
                    path: child.path
                }))
                .sort((a, b) => a.name > b.name);
        });
    }
});

