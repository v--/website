import Vue from 'vue';

import Scheduler from 'code/core/classes/scheduler';
import utils from 'code/core/helpers/utils';

import { ROWS, RENDER_PERIOD, BALL_RADIUS, BALL_SPEED } from 'code/breakout/constants/config';
import Intersection from 'code/breakout/classes/intersection';
import StylePos from 'code/breakout/classes/stylePos';
import Block from 'code/breakout/classes/block';
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
        blocks: context => context.store.blocks,
        intersectables: context => context.store.blocks.concat([context.store.grid, context.store.bar]),
        style: context => new StylePos(context.ball.pos)
    },

    methods: {
        getIntersection(): Intersection {
            return this.intersectables
                .map(i => i.intersection(this.ball))
                .reduce((a, b) => a.distance < b.distance ? a : b);
        },

        move() {
            this.ball.move(BALL_SPEED);
        },

        fail() {
            this.store.state = states.STOPPED;
        },

        reflect(distance: number, angle: number) {
            this.ball.move(distance);
            this.ball.angle = angle;
            this.ball.move(BALL_SPEED - distance);
        },

        devolve(block: Block) {
            block.devolve();

            if (block.value === 0)
                utils.deleteItem(this.blocks, block);

            this.store.score++; // Doesn't work without .store
        },

        tick() {
            const intersection = this.getIntersection(),
                actualDistance = intersection.distance - BALL_RADIUS;

            if (intersection.distance === Infinity || actualDistance > BALL_SPEED) {
                this.move();
            } else if (intersection.pos.y === ROWS) {
                // BEGIN HACK: Manually positioning the ball on the intersection as there are glitches otherwise
                this.ball.pos.x = intersection.pos.x;
                this.ball.pos.y = ROWS - BALL_RADIUS;
                // END HACK

                this.fail();
            } else {
                if (intersection.object.constructor === Block)
                    this.devolve(intersection.object);

                this.reflect(actualDistance, intersection.reflection);
            }
        }
    },

    watch: {
        'store.state': function(state) {
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
