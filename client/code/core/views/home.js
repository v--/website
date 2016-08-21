import Vue from 'vue';

import View from 'code/core/classes/view';
import Icon from 'code/core/components/icon';
import template from 'views/core/views/home';
import { CONTACTS } from 'code/core/constants/contacts';
import { factorize } from 'code/core/support/functional';

export default new View({
    name: 'home',
    testPath: path => path === '/',

    component: Vue.extend({
        name: 'HomeView',
        template: template,

        components: { Icon },

        data: factorize({
            contacts: CONTACTS
        })
    })
});
