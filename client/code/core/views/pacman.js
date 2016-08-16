import { KEY, KEYSERVERS } from 'code/core/constants/gpg_keys';
import { dumbCopy, groupBy } from 'code/core/support/misc';
import { constructs } from 'code/core/support/functional';
import { fetchJSON } from 'code/core/support/browser';
import PacmanPackage from 'code/core/models/pacman_package';
import View from 'code/core/classes/view';
import template from 'views/core/views/pacman';

export default new View({
    name: 'pacman',

    component: {
        name: 'iv-pacman',
        replace: false,
        template: template,

        props: {
            data: { type: Array, required: true }
        },

        data: () => ({
            key: KEY,
            keyservers: dumbCopy(KEYSERVERS)
        }),

        computed: {
            packages: context => groupBy(context.data, 'arch')
        }
    },

    resolve(_path) {
        return fetchJSON('/api/pacman').then(function (data) {
            return data.map(constructs(PacmanPackage));
        });
    }
});
