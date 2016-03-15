import Vue from 'vue';

import Doc from 'code/core/models/doc';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/docs';

const component = Vue.extend({
    name: 'i-docs',
    template: template,
    components: [Table],

    props: {
        data: { type: Array, required: true }
    },

    data: () => ({
        columns: [
            {
                name: 'Name',
                accessors: { value: 'name', hyperlink: 'path' }
            }
        ]
    })
});

export default new View({
    name: 'docs',
    component: component,
    resolve() {
        return browser.fetchJSON('/api/docs').then(function (data) {
            return data.map(raw => new Doc(raw.path, raw.name));
        });
    }
});
