import Vue from 'vue';

import { BUGREPORT } from 'code/core/constants/contacts';
import CoolError from 'code/core/classes/coolError';
import Icon from 'code/core/components/icon';
import template from 'views/core/views/error';
import utils from 'code/core/helpers/utils';
import View from 'code/core/classes/view';

const component = Vue.extend({
    name: 'i-error',
    replace: false,
    template: template,
    components: [Icon],

    props: {
        data: { type: Error, required: true }
    },

    data: () => ({
        bugurl: BUGREPORT
    }),

    computed: {
        error: function () {
            if (this.data instanceof CoolError)
                return this.data;
            else
                return CoolError.client;
        }
    }
});

export default new View({
    name: 'error',
    testPath: utils.returns(false),
    component: component
});
