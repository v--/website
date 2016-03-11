import Vue from 'vue';

import actions from 'code/core/actions';

export default Vue.directive('i-href', {
    deep: true,

    bind() {
        this.onClick = e => {
            e.preventDefault();
            actions.updatePath(this.vm.$store, this.href);
        };

        this.el.addEventListener('click', this.onClick);
    },

    update: function (href) {
        this.href = href;
        this.el.setAttribute('href', href);
    },

    unbind() {
        this.el.removeEventListener('click', this.onClick);
    }
});
