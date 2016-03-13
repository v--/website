import Vue from 'vue';

import template from 'views/core/components/radio';

export default Vue.extend({
    name: 'i-radio',
    template: template,

    props: {
        value:    { required: true },
        domain:   { type: Array, required: true }
    }
});
