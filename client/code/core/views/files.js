import Vue from 'vue';

import CoolError from 'code/core/classes/cool_error';
import Dir from 'code/core/models/dir';
import View from 'code/core/classes/view';
import Table from 'code/core/components/table';
import template from 'views/core/views/files';
import { fetchJSON } from 'code/core/support/browser';
import { humanizeSize } from 'code/core/support/numeric';
import { startsWithString } from 'code/core/support/misc';

const component = Vue.extend({
    name: 'iv-files',
    replace: false,
    template: template,
    components: [Table],

    props: {
        data: { type: Dir, required: true }
    },

    data: () => ({
        columns: [
            {
                name: 'Name',
                width: 2,
                accessors: { value: 'name', hyperlink: 'path' },
                onClick (e, row) {
                    if (!row.isDirectory)
                        return;

                    e.preventDefault();
                    this.$dispatch('updatePath', row.path);
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
                    view: node => humanizeSize(node.size)
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

    computed: {
        description: context => context.data.description,
        staticData: context => {
            if (context.data.parent === null)
                return [];

            const mock = context.data.parent.dup();
            mock.name = '..';
            return [mock];
        }
    }
});

export default new View({
    name: 'files',
    title: dir => dir.ancestors.map(node => node.name),
    testPath: path => startsWithString(path, '/files'),

    component: component,

    resolve(path) {
        return fetchJSON('/api/files').then(function (data) {
            const root = Dir.parseServerResponse(data).findByPath(path);

            if (root === null)
                throw CoolError.HTTP.notFound;

            return root;
        });
    }
});
