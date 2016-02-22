import _ from 'lodash';

import FSNode from 'code/core/models/fsNode';

export default class File extends FSNode {
    get type() {
        const name = this.name,
            type = _.last(this.name.split('.'));

        if (type === name || type === '')
            return 'Dotfile';

        return `${type.toUpperCase()} file`;
    }

    get isDirectory() {
        return false;
    }

    constructor(path: string, modified: string, size: number) {
        super(path, modified, size);
    }
}
