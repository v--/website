import Vue from 'vue';

import Slide from 'code/core/models/slide';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/slides';

const component = Vue.extend({
    template: template,

    data: () => ({
        columns: [
            {
                name: 'Name',
                accessors: { value: 'name', hyperlink: 'path' }
            }
        ]
    }),

    components: {
        'i-table': Table
    },

    vuex: {
        getters: {
            data: state => state.core.page.data.map(x => x.dup())
        }
    }
});

export default new View({
    name: 'slides',
    component: component,
    resolve() {
        return browser.fetchJSON('/api/slides').then(function (data) {
            return data.map(raw => new Slide(raw.path, raw.name));
        });
    }
});
