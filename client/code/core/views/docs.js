import Vue from 'vue';

import Doc from 'code/core/models/doc';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import template from 'views/core/views/docs';
import { fetchJSON } from 'code/core/support/browser';

const component = Vue.extend({
    name: 'iv-docs',
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
        return fetchJSON('/api/docs').then(function (data) {
            return data.map(raw => new Doc(raw.path, raw.name));
        });
    }
});
