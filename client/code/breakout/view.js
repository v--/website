import Vue from 'vue';

import View from 'code/core/classes/view';

import Grid from 'code/breakout/components/grid';
import Score from 'code/breakout/components/score';
import store from 'code/breakout/store';
import browser from 'code/core/helpers/browser';
import keycodes from 'code/core/constants/keycodes';
import states from 'code/breakout/constants/states';
import template from 'views/breakout/view';
import description from 'views/breakout/description';

export default new View({
    name: 'code-breakout',
    title: ['code', 'breakout'],
    inject: true,
    component: Vue.extend({
        replace: false,
        name: 'iv-code-breakout',
        template: template,
        components: [Grid, Score],
        // MathML + Vue.js = Exponential growth in false warnings
        data: () => ({ store, description }),

        methods: {
            toggleState() {
                let newState;

                switch (this.store.state) {
                case states.PAUSED:
                    newState = states.RUNNING;
                    break;

                case states.STOPPED:
                    this.store.reset();
                    newState = states.PAUSED;
                    break;

                case states.RUNNING:
                    newState = states.PAUSED;
                    break;
                }

                this.store.state = newState;
            },

            onKeyDown(e: KeyboardEvent) {
                switch (e.keyCode) {
                case keycodes.SPACE:
                    e.preventDefault();
                    this.toggleState();
                    break ;
                }
            }
        },

        created() {
            browser.on('keydown', this.onKeyDown);
        },

        destroyed() {
            browser.off('keydown', this.onKeyDown);
        }
    })
});
