import Vue from 'vue';

import View from 'code/core/classes/view';
import Radio from 'code/core/components/radio';
import { factorize } from 'code/core/support/functional';

import Demo from 'code/sorting/components/demo';
import algorithms from 'code/sorting/algos/index';
import bus from 'code/core/event_bus';
import template from 'views/sorting/view';
import { PERIODS, DEFAULT_PERIOD } from 'code/sorting/constants/periods';

export default new View({
    name: 'code/sorting',
    title: ['code', 'sorting'],
    inject: true,

    component: Vue.extend({
        name: 'CodeSorting',
        template: template,
        components: { Radio, Demo },

        data: factorize({
            algorithms: algorithms,
            period: DEFAULT_PERIOD,
            domain: PERIODS
        }),

        methods: {
            sortall() {
                bus.$emit('sort');
            },

            onPeriodChange(value) {
                this.period = value;
            }
        }
    })
});
