import Vue from 'vue';

import utils from 'code/core/helpers/utils';

import Algorithm from 'code/sorting/classes/algorithm';
import Sorter from 'code/sorting/components/sorter';
import sorters from 'code/sorting/constants/sorters';
import template from 'views/sorting/components/demo';

export default Vue.extend({
    name: 'i-sorting-demo',
    template: template,
    components: [Sorter],

    props: {
        algorithm: { type: Algorithm, required: true }
    },

    data: utils.returnsDumbCopy({ sorters }),

    methods: {
        sort() {
            this.$broadcast('sort');
        }
    }
});
