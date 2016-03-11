import Vue from 'vue';

import { CONTACTS } from 'code/core/constants/contacts';
import View from 'code/core/classes/view';
import Icon from 'code/core/components/icon';
import utils from 'code/core/helpers/utils';
import template from 'views/core/views/home';

export default new View({
    name: 'home',
    testPath: path => path === '/',

    component: Vue.extend({
        template: template,

        components: {
            'i-icon': Icon
        },

        data: utils.returnsDumbCopy({
            contacts: CONTACTS
        })
    })
});
