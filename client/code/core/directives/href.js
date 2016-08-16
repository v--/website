import Vue from 'vue';

export default Vue.directive('i-href', {
    deep: true,

    bind() {
        this.onClick = e => {
            e.preventDefault();
            this.vm.$dispatch('updatePath', this.href);
        };

        this.el.addEventListener('click', this.onClick);
    },

    update (href) {
        this.href = href;
        this.el.setAttribute('href', href);
    },

    unbind() {
        this.el.removeEventListener('click', this.onClick);
    }
});
