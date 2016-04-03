import Vue from 'vue';

import utils from 'code/core/helpers/utils';
import browser from 'code/core/helpers/browser';
import template from 'views/core/components/viewbox';

// This component seems a little pointless all by itself, but does nice stuff in conjunction with max-height
export default Vue.extend({
    name: 'i-viewbox',
    template: template,

    props: {
        ratio: { type: Number, required: true }
    },

    methods: {
        resize() {
            this.$el.style.height = utils.pixelize(this.$el.offsetWidth / this.ratio);
            this.$el.querySelector('.viewbox').style.width = utils.pixelize(this.$el.offsetHeight * this.ratio);
        }
    },

    created() {
        browser.on('resize', this.resize);
    },

    ready() {
        this.resize();
    },

    destroyed() {
        browser.off('resize', this.resize);
    }
});
