import Vue from 'vue';

import BUNDLES from 'code/core/constants/bundles';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import utils from 'code/core/helpers/utils';
import template from 'views/core/views/code';

export default new View({
    name: 'code',

    component: Vue.extend({
        name: 'i-code',
        replace: false,
        template: template,
        components: [Table],

        data: () => ({
            bundles: utils.dumbCopy(BUNDLES),
            columns: [
                {
                    name: 'Name',
                    accessors: { value: 'name', hyperlink: 'path' },
                    onClick: function (e, row) {
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
