export default class Slide {
    constructor(path, name) {
        this.path = path;
        this.name = name;
    }

    dup() {
        return new Slide(this.path, this.name);
    }
}
