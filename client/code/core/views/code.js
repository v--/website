import Vue from 'vue';

import BUNDLES from 'code/core/constants/bundles';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import utils from 'code/core/helpers/utils';
import actions from 'code/core/actions';
import template from 'views/core/views/code';

export default new View({
    name: 'code',

    component: Vue.extend({
        template: template,

        data: () => ({
            bundles: utils.dumbCopy(BUNDLES),
            columns: [
                {
                    name: 'Name',
                    accessors: { value: 'name', hyperlink: 'path' },
                    onClick: function (e, row) {
                        e.preventDefault();
                        actions.updatePath(this.$store, row.path);
                    }
                },

                {
                    name: 'Summary',
                    width: 2,
                    accessors: { value: 'summary' }
                }
            ]
        }),

        components: {
            'i-table': Table
        }
    })
});
