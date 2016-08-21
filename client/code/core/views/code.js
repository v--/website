import Vue from 'vue';

import bundles from 'code/core/constants/bundles';
import View from 'code/core/classes/view';
import Grid from 'code/core/components/grid';
import template from 'views/core/views/code';
import bus from 'code/core/event_bus';
import { factorize } from 'code/core/support/functional';

export default new View({
    name: 'code',

    component: Vue.extend({
        name: 'CodeView',
        template: template,
        components: { Grid },

        data: factorize({
            bundles: bundles,
            columns: [
                {
                    name: 'Name',
                    accessors: { value: 'name', hyperlink: 'path' },
                    onClick(e, row) {
                        e.preventDefault();
                        bus.$emit('updatePath', row.path);
                    }
                },

                {
                    name: 'Summary',
                    width: 2,
                    accessors: { value: 'summary' }
                }
            ]
        })
    })
});
