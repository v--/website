import Vue from 'vue';

import store from 'code/breakout/store';
import states from 'code/breakout/constants/states';
import template from 'views/breakout/components/score';

export default Vue.extend({
    name: 'i-breakout-score',
    template: template,
    data: () => ({ store }),
    computed: {
        score: context => context.store.score,
        paused: context => context.store.state === states.PAUSED,
        stopped: context => context.store.state === states.STOPPED
    }
});
