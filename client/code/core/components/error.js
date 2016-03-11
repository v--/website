import Vue from 'vue';

import { BUGREPORT } from 'code/core/constants/contacts';
import CoolError from 'code/core/classes/coolError';
import Icon from 'code/core/components/icon';
import template from 'views/core/components/error';
import utils from 'code/core/helpers/utils';

export default Vue.extend({
    name: 'i-error',
    template: template,
    components: [Icon],

    data: utils.returnsDumbCopy({
        bugurl: BUGREPORT
    }),

    computed: {
        displayError: function () {
            if (this.error instanceof CoolError)
                return this.error;
            else
                return CoolError.client;
        }
    },

    vuex: {
        getters: {
            error: state => state.core.error
        }
    }
});
