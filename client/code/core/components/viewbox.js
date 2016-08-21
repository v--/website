import Vue from 'vue';

import browser from 'code/core/support/browser';
import template from 'views/core/components/viewbox';
import { pixelize } from 'code/core/support/numeric';

// This component seems a little pointless all by itself, but does nice stuff in conjunction with max-height
export default Vue.extend({
    template: template,

    props: {
        ratio: { type: Number, required: true }
    },

    methods: {
        resize() {
            this.$el.style.height = pixelize(this.$el.offsetWidth / this.ratio);
            this.$el.querySelector('.viewbox').style.width = pixelize(this.$el.offsetHeight * this.ratio);
        }
    },

    created() {
        browser.on('resize', this.resize);
    },

    mounted() {
        this.resize();
    },

    destroyed() {
        browser.off('resize', this.resize);
    }
});
