import Vue from 'vue';

import { factorize } from 'code/core/support/functional';

import Sorter from 'code/sorting/components/sorter';
import sorters from 'code/sorting/constants/sorters';
import template from 'views/sorting/components/demo';
import bus from 'code/core/event_bus';

export default Vue.extend({
    template: template,
    components: { Sorter },

    props: {
        period: { type: Number, required: true },
        algorithm: { type: Object, required: true }
    },

    data: factorize({
        sorters
    }),

    methods: {
        sort() {
            bus.$emit('sort', this.algorithm);
        }
    }
});
