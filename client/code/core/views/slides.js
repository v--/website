import Vue from 'vue';

import Slide from 'code/core/models/slide';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import template from 'views/core/views/slides';
import { fetchJSON } from 'code/core/support/browser';

const component = Vue.extend({
    name: 'iv-slides',
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
    name: 'slides',
    replace: false,
    component: component,
    resolve() {
        return fetchJSON('/api/slides').then(function (data) {
            return data.map(raw => new Slide(raw.path, raw.name));
        });
    }
});
