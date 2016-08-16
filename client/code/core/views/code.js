import Vue from 'vue';

import bundles from 'code/core/constants/bundles';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import template from 'views/core/views/code';
import { dumbCopy } from 'code/core/support/misc';

export default new View({
    name: 'code',

    component: Vue.extend({
        name: 'iv-code',
        replace: false,
        template: template,
        components: [Table],

        data: () => ({
            bundles: dumbCopy(bundles),
            columns: [
                {
                    name: 'Name',
                    accessors: { value: 'name', hyperlink: 'path' },
                    onClick (e, row) {
                        e.preventDefault();
                        this.$dispatch('updatePath', row.path);
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
