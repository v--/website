import Vue from 'vue';

import { CONTACTS } from 'code/core/constants/contacts';
import { dumbCopy } from 'code/core/support/misc';
import View from 'code/core/classes/view';
import Icon from 'code/core/components/icon';
import template from 'views/core/views/home';

export default new View({
    name: 'home',
    testPath: path => path === '/',

    component: Vue.extend({
        name: 'iv-home',
        replace: false,
        template: template,

        components: [Icon],

        data: () => ({
            contacts: dumbCopy(CONTACTS)
        })
    })
});
