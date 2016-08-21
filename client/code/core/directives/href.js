import Vue from 'vue';
import bus from 'code/core/event_bus';

export default Vue.directive('i-href', {
    deep: true,

    bind(el, binding) {
        binding.onClick = function(e) {
            e.preventDefault();
            bus.$emit('updatePath', binding.value);
        };

        el.addEventListener('click', binding.onClick);
    },

    update (el, binding) {
        el.setAttribute('href', binding.value);
    },

    unbind(el, binding) {
        el.removeEventListener('click', binding.onClick);
    }
});
