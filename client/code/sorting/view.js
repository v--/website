import Vue from 'vue';

import View from 'code/core/classes/view';
import Radio from 'code/core/components/radio';
import utils from 'code/core/helpers/utils';

import { PERIODS, DEFAULT_PERIOD } from 'code/sorting/constants/periods';
import Demo from 'code/sorting/components/demo';
import algorithms from 'code/sorting/algos/index';
import template from 'views/sorting/view';

export default new View({
    name: 'code-sorting',
    title: ['code', 'sorting'],
    inject: true,

    component: Vue.extend({
        name: 'i-code-sorting',
        template: template,
        components: [Radio, Demo],

        data: utils.returnsDumbCopy({
            algorithms: algorithms,
            period: DEFAULT_PERIOD,
            domain: PERIODS
        }),

        methods: {
            sortall() {
                this.$broadcast('sort');
            }
        }
    })
});
