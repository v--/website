import FSNode from 'code/core/models/fsNode';

export default class File extends FSNode {
    get type() {
        const name = this.name;
        const type = this.name.split('.').pop();

        if (type === name || type === '')
            return 'Dotfile';

        return `${type.toUpperCase()} file`;
    }

    get isDirectory() {
        return false;
    }

    constructor(path, modified, size, parent) {
        super(path, modified, size, parent);
    }
}
