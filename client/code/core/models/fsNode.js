import utils from 'code/core/helpers/utils';

export default class FSNode {
    get name(): string {
        return this._name || utils.basename(this.path);
    }

    set name(name: string) {
        this._name = name;
    }

    get isDirectory() {
        throw new Error('FSNode#isDirectory must be overriden');
    }

    constructor(path: string, modified: Date, size: number) {
        pre: this.constructor !== FSNode;
        this.path = path;
        this.size = size;
        this.modified = modified;
        this.parent = null;
    }

    matchesPath(path: string): boolean {
        return this.path === path.replace(/\/$/, '');
    }

    setParent(parent: FSNode) {
        this.parent = parent;
    }
}
