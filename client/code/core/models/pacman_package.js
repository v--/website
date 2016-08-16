export default class PacmanPackage {
    constructor(raw) {
        this.name = raw.name;
        this.version = raw.version;
        this.arch = raw.arch;
    }
}
