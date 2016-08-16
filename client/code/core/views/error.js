import Vue from 'vue';

import { BUGREPORT } from 'code/core/constants/contacts';
import CoolError from 'code/core/classes/cool_error';
import View from 'code/core/classes/view';
import Icon from 'code/core/components/icon';
import template from 'views/core/views/error';
import { factorize } from 'code/core/support/functional';

const component = Vue.extend({
    name: 'iv-error',
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
        error () {
            if (this.data instanceof CoolError)
                return this.data;
            else
                return CoolError.client;
        }
    }
});

export default new View({
    name: 'error',
    testPath: factorize(false),
    component: component
});
