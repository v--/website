import Vue from 'vue';

import utils from 'code/core/helpers/utils';

import Sorter from 'code/sorting/components/sorter';
import sorters from 'code/sorting/constants/sorters';
import template from 'views/sorting/components/demo';

export default Vue.extend({
    name: 'i-sorting-demo',
    template: template,
    components: [Sorter],

    props: {
        period: { type: Number, required: true },
        algorithm: { type: Object, required: true }
    },

    data: () => ({
        sorters: utils.dumbCopy(sorters)
    }),

    methods: {
        sort() {
            this.$broadcast('sort');
        }
    }
});
