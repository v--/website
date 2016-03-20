import Vue from 'vue';

import Scheduler from 'code/core/classes/scheduler';
import utils from 'code/core/helpers/utils';

import { DEFAULT_PERIOD } from 'code/sorting/constants/periods';
import template from 'views/sorting/components/sorter';

export default Vue.extend({
    name: 'i-sorting-sorter',
    template: template,

    props: {
        period:  { type: Number, required: true },
        name:    { type: String, required: true },
        prototype: { type: Array, required: true },
        algorithm: { type: Object, required: true }
    },

    data: () => ({
        scheduler: new Scheduler(DEFAULT_PERIOD),
        iterator: null,
        complete: false,
        lastChanged: [],
        array: []
    }),

    computed: {
        ratio: context => 100 / context.array.length,
        rawNodes: context => context.$el.lastChild.children
    },

    methods: {
        getWidth(item: number) {
            return `${item * this.ratio}%`;
        },

        swap(a: number, b: number) {
            const temp = this.array[a];
            this.array.$set(a, this.array[b]);
            this.array.$set(b, temp);
        },

        clearLastChanged() {
            for (let index of this.lastChanged)
                this.rawNodes[index].className = '';

            this.lastChanged = [];
        },

        // The update itself is done cleanly with Vue, hovewer changing the css classes is not
        iteration() {
            const result = this.iterator.next();
            this.clearLastChanged();

            if (result.done) {
                this.complete = true;
                return;
            }

            const { a, b } = result.value;

            if (result.value.swap)
                this.swap(a, b);

        try {
            this.rawNodes[a].className = this.rawNodes[b].className = result.value.swap ? 'swapped' : 'still';
        } catch (e) {
            this.scheduler.stop();
        }
            this.lastChanged = [a, b];
        },

        reinitialize() {
            this.scheduler.stop();
            this.clearLastChanged();
            this.array = utils.dumbCopy(this.prototype);
            this.iterator = this.algorithm.generator(this.array);
            this.complete = false;
        }
    },

    events: {
        sort() {
            this.reinitialize();
            this.scheduler.start();
        }
    },

    watch: {
        prototype() {
            this.reinitialize();
        },

        period() {
            const start = this.scheduler.isRunning;

            this.scheduler.stop();
            this.scheduler.period = this.period;

            if (start)
                this.scheduler.start();
        }
    },

    ready() {
        this.reinitialize();
        this.scheduler.callback = ::this.iteration;
    },

    beforeDestroy() {
        this.scheduler.stop();
    }
});
