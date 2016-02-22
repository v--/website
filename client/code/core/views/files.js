import _ from 'lodash';
import Markdown from 'react-remarkable';

import View from 'code/core/helpers/view';
import Table from 'code/core/components/table';
import jsonFetcher from 'code/core/helpers/jsonFetcher';
import Dir from 'code/core/models/dir';
import { go } from 'code/core/router';
import { $ } from 'code/core/helpers/component';

export default class Files extends View {
    // @override
    static get title() {
        return 'files';
    }

    // @override
    static get route() {
        return '/files';
    }

    // @override
    static get icon() {
        return 'files-o';
    }

    // @override
    static get updateOnResize() {
        return true;
    }

    static generateHeading(data) {
        return `Contents of "${data.path}"`;
    }

    // @override
    static resolver() {
        return jsonFetcher('/api/files', Dir.parseServerResponse);
    }

    // @override
    static subviews(files: Dir) {
        return _(files.dirs)
            .sortBy('name')
            .map(node => View.generate(node.name, node.path))
            .value();
    }

    static onNameClick(e, data: Object) {
        if (!data.isDirectory) return;
        e.preventDefault();
        go(data.path);
    }

    static createMockParent(actual) {
        return _(actual)
            .pick(['path', 'type', 'sizeString', 'dateString'])
            .merge({ name: '..', isDirectory: true })
            .value();
    }

    // @override
    render() {
        const { data } = this.props,
            parent = data.parent && Files.createMockParent(data.parent);

        let croppedViewport = this.props.viewport.clone();

        // HACK: BEGIN
        if (data.hasDescription) {
            let padding = croppedViewport.height * 1 / 3;
            croppedViewport.height -= padding;
            croppedViewport.bottom -= padding;
        }
        // HACK: END

        return $('div', null,
            $(Table, {
                initialSort: { columnIndex: 1 },
                viewport: croppedViewport,
                data: data.children,
                staticData: parent && [parent],
                columns: [{
                    name: 'Name',
                    width: 2,
                    accessors: { value: 'name', hyperlink: 'path', click: ::Files.onNameClick }
                }, {
                    name: 'Type',
                    width: 2,
                    accessors: { value: 'typeAccessor', view: 'type' }
                }, {
                    name: 'Size',
                    width: 2,
                    accessors: { value: 'sizeAccessor', view: 'sizeString' }
                }, {
                    name: 'Modified',
                    width: 3,
                    accessors: { value: 'modifiedAccessor', view: 'modifiedString' }
                }]
            }),
            data.hasDescription && $(Markdown, { source: data.markdown })
        );
    }
}
