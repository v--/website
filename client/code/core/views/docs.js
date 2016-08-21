import Vue from 'vue';

import Doc from 'code/core/models/doc';
import View from 'code/core/classes/view';
import Grid from 'code/core/components/grid';
import template from 'views/core/views/docs';
import { factorize } from 'code/core/support/functional';
import { fetchJSON } from 'code/core/support/browser';

const component = Vue.extend({
    name: 'DocsView',
    template: template,
    components: { Grid },

    props: {
        data: { type: Array, required: true }
    },

    data: factorize({
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
