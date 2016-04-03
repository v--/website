import Vue from 'vue';

import Block from 'code/breakout/classes/block';
import StylePos from 'code/breakout/classes/stylePos';
import template from 'views/breakout/components/block';

export default Vue.extend({
    name: 'i-breakout-block',
    template: template,

    props: {
        block: { type: Block, required: true }
    },

    computed: {
        class: context => `breakout-block-${context.block.value}`,
        style: context => new StylePos(context.block.pos)
    }
});
