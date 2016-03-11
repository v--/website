import Vue from 'vue';

import CoolError from 'code/core/classes/coolError';
import FSNode from 'code/core/models/fsNode';
import Dir from 'code/core/models/dir';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import actions from 'code/core/actions';
import utils from 'code/core/helpers/utils';
import browser from 'code/core/helpers/browser';
import template from 'views/core/views/files';

const component = Vue.extend({
    template: template,

    data: () => ({
        columns: [
            {
                name: 'Name',
                width: 2,
                accessors: { value: 'name', hyperlink: 'path' },
                onClick: function (e, row: FSNode) {
                    if (!row.isDirectory)
                        return;

                    e.preventDefault();
                    actions.updatePath(this.$store, row.path);
                }
            },

            {
                name: 'Type',
                width: 2,
                accessors: { value: 'type' }
            },

            {
                name: 'Size',
                width: 2,
                accessors: {
                    value: 'size',
                    view: node => utils.humanizeSize(node.size)
                }
            },

            {
                name: 'Modified',
                width: 3,
                accessors: {
                    value: node => node.modified.getTime(),
                    view: node => node.modified.toLocaleString()
                }
            }
        ]
    }),

    components: {
        'i-table': Table
    },

    computed: {
        description: context => context.data.description,
        staticData: context => {
            if (context.data.parent === null)
                return [];

            const mock = context.data.parent.dupSingle();
            mock.name = '..';
            return [mock];
        }
    },

    vuex: {
        getters: {
            data: state => state.core.page.data.dupShallow()
        }
    }
});

export default new View({
    name: 'files',
    title: dir => dir.ancestors.map(node => node.name),
    testPath: path => utils.startsWithString(path, '/files'),

    component: component,

    resolve(path: string) {
        return browser.fetchJSON('/api/files').then(function (data) {
            const root = Dir.parseServerResponse(data).findByPath(path);

            if (root === null)
                throw CoolError.HTTP.notFound;

            return root;
        });
    }
});
