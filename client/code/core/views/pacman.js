import Vue from 'vue';
import PacmanPackage from 'code/core/models/pacman_package';
import View from 'code/core/classes/view';
import template from 'views/core/views/pacman';
import { KEY, KEYSERVERS } from 'code/core/constants/gpg_keys';
import { groupBy } from 'code/core/support/misc';
import { constructs } from 'code/core/support/functional';
import { fetchJSON } from 'code/core/support/browser';
import { factorize } from 'code/core/support/functional';

export default new View({
    name: 'pacman',

    component: Vue.extend({
        name: 'PacmanView',
        template: template,

        props: {
            data: { type: Array, required: true }
        },

        data: factorize({
            key: KEY,
            keyservers: KEYSERVERS
        }),

        computed: {
            packages: context => groupBy(context.data, 'arch')
        }
    }),

    resolve(_path) {
        return fetchJSON('/api/pacman').then(function (data) {
            return data.map(constructs(PacmanPackage));
        });
    }
});
