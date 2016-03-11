import Vue from 'vue';

import View from 'code/core/classes/view';
import utils from 'code/core/helpers/utils';

import Demo from 'code/sorting/components/demo';
import algorithms from 'code/sorting/algos/index';
import template from 'views/sorting/view';

export default new View({
    name: 'code-sorting',
    title: ['code', 'sorting'],
    inject: true,
    component: Vue.extend({
        template: template,

        data: utils.returnsDumbCopy({ algorithms }),

        components: {
            'i-sorting-demo': Demo
        },

        methods: {
            sortall() {
                this.$broadcast('sort');
            }
        }
    })
});
