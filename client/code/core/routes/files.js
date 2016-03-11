import Route from 'code/core/classes/route';
import utils from 'code/core/helpers/utils';
import browser from 'code/core/helpers/browser';

export default new Route({
    name: 'files',
    path: '/files',

    children: function () {
        return browser.fetchJSON('/api/files').then(function (data: Object) {
            return data.children.filter(child => child.isDirectory).map(child => new Route({
                name: utils.basename(child.path),
                path: child.path
            }));
        });
    }
});

