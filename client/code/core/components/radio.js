import Vue from 'vue';

import template from 'views/core/components/radio';

export default Vue.extend({
    template: template,

    props: {
        value:    { required: true },
        domain:   { type: Array, required: true },
        onChange: { type: Function, required: true }
    }
});
