import Markdown from 'react-remarkable';
import { createElement } from 'react';

import View from 'code/helpers/view';
import Table from 'code/components/table';
import jsonFetcher from 'code/helpers/jsonFetcher';
import Dir from 'code/models/dir';
import { go } from 'code/router';

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
        return files.dirs.map(node => View.generate(node.name, node.path));
    }

    static onNameClick(e, data: Object) {
        if (!data.isDirectory) return;
        e.preventDefault();
        go(data.path);
    }

    static createMockParent(actual) {
        return actual
            .select(['path', 'type', 'sizeString', 'dateString'])
            .merge({ name: '..', isDirectory: true });
    }

    // @override
    render() {
        const
            { data } = this.props,
            parent = data.parent && Files.createMockParent(data.parent);

        let croppedViewport = this.props.viewport.clone();

        // HACK: BEGIN
        if (data.hasDescription) {
            let padding = croppedViewport.height * 1 / 3;
            croppedViewport.height -= padding;
            croppedViewport.bottom -= padding;
        }
        // HACK: END

        return createElement('div', null,
            createElement(Table, {
                initialSort: { columnIndex: 0 },
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
                    accessors: { value: 'type' }
                }, {
                    name: 'Size',
                    width: 2,
                    accessors: { value: 'size', view: 'sizeString' }
                }, {
                    name: 'Modified',
                    width: 3,
                    accessors: { value: 'modified', view: 'modifiedString' }
                }]
            }),
            data.hasDescription && createElement(Markdown, { source: data.markdown })
        );
    }
}
