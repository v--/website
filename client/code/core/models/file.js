import FSNode from 'code/core/models/fsNode';

export default class File extends FSNode {
    get type() {
        const name = this.name,
            type = this.name.split('.').pop();

        if (type === name || type === '')
            return 'Dotfile';

        return `${type.toUpperCase()} file`;
    }

    get isDirectory() {
        return false;
    }

    constructor(path: string, modified: Date, size: number, parent: ?FSNode) {
        super(path, modified, size, parent);
    }
}
