import FSNode from 'code/models/fsNode';

export default class File extends FSNode {
    get type() {
        const name = this.name,
            type = this.name.split('.').last();

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
