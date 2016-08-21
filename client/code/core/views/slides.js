import Vue from 'vue';

import Slide from 'code/core/models/slide';
import View from 'code/core/classes/view';
import Grid from 'code/core/components/grid';
import template from 'views/core/views/slides';
import { fetchJSON } from 'code/core/support/browser';
import { factorize } from 'code/core/support/functional';

const component = Vue.extend({
    name: 'SlidesView',
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
    name: 'slides',
    component: component,
    resolve() {
        return fetchJSON('/api/slides').then(function (data) {
            return data.map(raw => new Slide(raw.path, raw.name));
        });
    }
});
