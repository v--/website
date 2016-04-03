import Vue from 'vue';

import utils from 'code/core/helpers/utils';

import Block from 'code/breakout/classes/block';
import template from 'views/breakout/components/block';

export default Vue.extend({
    name: 'i-breakout-block',
    template: template,

    props: {
        block: { type: Block, required: true }
    },

    computed: {
        class() {
            return `breakout-block-${this.block.value}`;
        },

        style() {
            const pos = this.block.unitPos;

            return {
                left: utils.percentize(pos.x),
                top: utils.percentize(pos.y)
            };
        }
    }
});
