import Vue from 'vue';

import Doc from 'code/core/models/doc';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/docs';

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
    name: 'docs',
    component: component,
    resolve() {
        return browser.fetchJSON('/api/docs').then(function (data) {
            return data.map(raw => new Doc(raw.path, raw.name));
        });
    }
});
