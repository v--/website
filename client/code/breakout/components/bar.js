import Vue from 'vue';

import Scheduler from 'code/core/classes/scheduler';
import utils from 'code/core/helpers/utils';

import { RENDER_PERIOD, BAR_SPEED } from 'code/breakout/constants/config';
import store from 'code/breakout/store';
import browser from 'code/core/helpers/browser';
import keycodes from 'code/core/constants/keycodes';
import states from 'code/breakout/constants/states';
import template from 'views/breakout/components/bar';

const directions = utils.enumerize([
    'LEFT',
    'RIGHT'
]);

export default Vue.extend({
    name: 'i-breakout-bar',
    template: template,

    data: () => ({
        scheduler: new Scheduler(RENDER_PERIOD),
        direction: null,
        store: store
    }),

    computed: {
        bar: context => context.store.bar,
        style: context => ({
            left: utils.percentize(context.bar.unitPos.x)
        })
    },

    methods: {
        move() {
            if (this.direction === directions.RIGHT)
                this.store.bar.move(BAR_SPEED);
            else if (this.direction === directions.LEFT)
                this.store.bar.move(-BAR_SPEED);
        },

        resetDirection() {
            this.direction = null;
            this.scheduler.stop();
        },

        ensureRunning() {
            if (!this.scheduler.isRunning && this.store.state === states.RUNNING)
                this.scheduler.start();
        },

        onKeyDown(e: KeyboardEvent) {
            switch (e.keyCode) {
            case keycodes.LEFT:
                this.direction = directions.LEFT;
                this.ensureRunning();
                break;

            case keycodes.RIGHT:
                this.direction = directions.RIGHT;
                this.ensureRunning();
                break;
            }
        },

        onKeyUp(e: KeyboardEvent) {
            if (this.store.state !== states.RUNNING)
                this.scheduler.stop();

            switch (e.keyCode) {
            case keycodes.LEFT:
                if (this.direction === directions.LEFT)
                    this.resetDirection();

                break;

            case keycodes.RIGHT:
                if (this.direction === directions.RIGHT)
                    this.resetDirection();

                break;
            }
        }
    },

    watch: {
        'store.state': function(state) {
            if (state === states.RUNNING && this.direction !== null)
                this.scheduler.start();
        }
    },

    created() {
        this.scheduler.callback = this.move;
        browser.on('keydown', this.onKeyDown);
        browser.on('keyup', this.onKeyUp);
    },

    destroyed() {
        this.scheduler.stop();
        browser.off('keydown', this.onKeyDown);
        browser.off('keyup', this.onKeyUp);
    }
});
