import Vue from 'vue';

import Scheduler from 'code/core/classes/scheduler';
import Viewbox from 'code/core/components/viewbox';

import { UPDATE_PERIOD } from 'code/breakout/constants/config';
import store from 'code/breakout/store';
import states from 'code/breakout/constants/states';
import Block from 'code/breakout/components/block';
import Ball from 'code/breakout/components/ball';
import Bar from 'code/breakout/components/bar';
import template from 'views/breakout/components/grid';

export default Vue.extend({
    name: 'i-breakout-grid',
    template: template,
    components: [Viewbox, Bar, Ball, Block],

    data: () => ({
        scheduler: new Scheduler(UPDATE_PERIOD),
        store: store
    }),

    computed: {
        blocks: context => context.store.blocks
    },

    methods: {
        tick() {
            // console.warn('TICK');
        }
    },

    watch: {
        'store.state': function(state) {
            if (state === states.RUNNING)
                this.scheduler.start();

            return true;
        }
    },

    created() {
        this.scheduler.callback = this.tick;
    },

    destroyed() {
        this.scheduler.stop();
    }
});
