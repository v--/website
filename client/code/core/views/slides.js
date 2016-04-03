import Vue from 'vue';

import Slide from 'code/core/models/slide';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/slides';

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
        return browser.fetchJSON('/api/slides').then(function (data) {
            return data.map(raw => new Slide(raw.path, raw.name));
        });
    }
});
