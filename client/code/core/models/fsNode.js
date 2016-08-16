import { basename } from 'code/core/support/misc';

export default class FSNode {
    get name() {
        return this._name || basename(this.path);
    }

    set name(name) {
        this._name = name;
    }

    get isDirectory() {
        throw new Error('FSNode#isDirectory must be overriden');
    }

    constructor(path, modified, size) {
        pre: this.constructor !== FSNode;
        this.path = path;
        this.size = size;
        this.modified = modified;
        this.parent = null;
    }

    matchesPath(path) {
        return this.path === path.replace(/\/$/, '');
    }

    setParent(parent) {
        this.parent = parent;
    }
}
