export default class Doc {
    constructor(path, name) {
        this.path = path;
        this.name = name;
    }

    dup() {
        return new Doc(this.path, this.name);
    }
}
