import humanizeSize from 'code/helpers/humanizeSize';

export default class FSNode {
    get name() {
        return this.path.basename();
    }

    get sizeString() {
        return humanizeSize(this.size);
    }

    get modifiedString() {
        return (new Date(this.modified)).toLocaleString();
    }

    get typeAccessor() {
        return this.type + this.name;
    }

    get sizeAccessor() {
        return this.size + this.name;
    }

    get modifiedAccessor() {
        return this.modified + this.name;
    }

    get isDirectory() {
        throw new Error('FSNode#isDirectory must be overriden');
    }

    constructor(path: string, modified: string, size: number) {
        this.path = path;
        this.size = size;
        this.modified = (new Date(modified)).getTime();
    }

    matchesPath(path: string) {
        return this.path === path.remove(/\/$/);
    }
}
