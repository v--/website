import Vue from 'vue';

import Scheduler from 'code/core/classes/scheduler';
import utils from 'code/core/helpers/utils';

import { ROWS, RENDER_PERIOD, BALL_SPEED } from 'code/breakout/constants/config';
import Intersection from 'code/breakout/classes/intersection';
import store from 'code/breakout/store';
import states from 'code/breakout/constants/states';
import template from 'views/breakout/components/ball';

export default Vue.extend({
    name: 'i-breakout-ball',
    template: template,

    data: () => ({
        scheduler: new Scheduler(RENDER_PERIOD),
        store: store
    }),

    computed: {
        ball: context => context.store.ball,
        intersectables: context => context.store.blocks.concat([context.store.grid, context.store.bar]),

        style() {
            const pos = this.ball.unitPos;

            return {
                left: utils.percentize(pos.x),
                top: utils.percentize(pos.y)
            };
        }
    },

    methods: {
        getIntersection() {
            const front = this.ball.front;

            return this.intersectables
                .map(i => i.intersection(front, this.ball.angle))
                .reduce((a, b) => a.distance < b.distance ? a : b);
        },

        move() {
            this.ball.move(BALL_SPEED);
        },

        fail(intersection: Intersection) {
            this.ball.move(intersection.distance);
            this.store.state = states.STOPPED;
        },

        reflect(intersection: Intersection) {
            this.ball.move(intersection.distance);
            this.ball.angle = intersection.reflection;
            this.ball.move(BALL_SPEED - intersection.distance);
        },

        tick() {
            const intersection = this.getIntersection();

            if (intersection.distance === Infinity || intersection.distance > BALL_SPEED)
                this.move();
            else if (intersection.pos.y === ROWS)
                this.fail(intersection);
            else
                this.reflect(intersection);
        }
    },

    watch: {
        'store.state': function(state) {
            this.saved = this.ball.pos;

            if (state === states.RUNNING)
                this.scheduler.start();
            else
                this.scheduler.stop();
        }
    },

    created() {
        this.scheduler.callback = this.tick;
    },

    destroyed() {
        this.scheduler.stop();
    }
});
