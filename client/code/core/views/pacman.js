import Vue from 'vue';

import { KEY, KEYSERVERS } from 'code/core/constants/gpgKeys';
import PacmanPackage from 'code/core/models/pacmanPackage';
import View from 'code/core/classes/view';
import utils from 'code/core/helpers/utils';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/pacman';

export default new View({
    name: 'pacman',

    component: Vue.extend({
        template: template,

        data: () => ({
            key: KEY,
            keyservers: KEYSERVERS
        }),

        vuex: {
            getters: {
                packages: state => utils.groupBy(state.core.page.data, 'arch')
            }
        }
    }),

    resolve(_path: string) {
        return browser.fetchJSON('/api/pacman').then(function (data) {
            return data.map(utils.constructs(PacmanPackage));
        });
    }
});
