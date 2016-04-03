import Vue from 'vue';

import View from 'code/core/classes/view';
import template from 'views/forex/view';

export default new View({
    name: 'code-forex',
    title: ['code', 'forex'],
    inject: true,
    component: Vue.extend({
        replace: false,
        name: 'iv-code-forex',
        template: template
    })
});
