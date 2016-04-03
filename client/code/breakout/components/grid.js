import Vue from 'vue';

import Scheduler from 'code/core/classes/scheduler';
import Viewbox from 'code/core/components/viewbox';
import utils from 'code/core/helpers/utils';

import { COLS, UPDATE_PERIOD, BLOCK_REACH, BLOCK_Y_LIMIT } from 'code/breakout/constants/config';
import store from 'code/breakout/store';
import states from 'code/breakout/constants/states';
import BlockClass from 'code/breakout/classes/block';
import Block from 'code/breakout/components/block';
import Ball from 'code/breakout/components/ball';
import Bar from 'code/breakout/components/bar';
import laplaceRandom from 'code/breakout/helpers/laplaceRandom';
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
        pickPos() {
            const base = utils.randomElement(this.blocks),
                chosen = laplaceRandom.radial(base.pos, BLOCK_REACH);

            if (utils.isBetween(chosen.x, 0, COLS) && utils.isBetween(chosen.y, 0, BLOCK_Y_LIMIT))
                return chosen;

            return null;
        },

        tick() {
            const chosenPos = this.pickPos(),
                chosen = chosenPos && this.blocks.find(block => block.pos.equals(chosenPos));

            if (chosen) {
                chosen.evolve();
            } else if (chosenPos) {
                const newborn = new BlockClass(chosenPos.x, chosenPos.y);
                this.blocks.push(newborn);
            }
        }
    },

    watch: {
        'store.state': function(state) {
            if (state === states.RUNNING)
                this.scheduler.start();
            else
                this.scheduler.stop();

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
