import { KEY, KEYSERVERS } from 'code/core/constants/gpgKeys';
import PacmanPackage from 'code/core/models/pacmanPackage';
import View from 'code/core/classes/view';
import utils from 'code/core/helpers/utils';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/pacman';

export default new View({
    name: 'pacman',

    component: {
        name: 'i-pacman',
        replace: false,
        template: template,

        props: {
            data: { type: Array, required: true }
        },

        data: () => ({
            key: KEY,
            keyservers: utils.dumbCopy(KEYSERVERS)
        }),

        computed: {
            packages: context => utils.groupBy(context.data, 'arch')
        }
    },

    resolve(_path: string) {
        return browser.fetchJSON('/api/pacman').then(function (data) {
            return data.map(utils.constructs(PacmanPackage));
        });
    }
});
