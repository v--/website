export default class Slide {
    get dateString() {
        return (new Date(this.date)).toLocaleString();
    }

    constructor(raw) {
        this.path = raw.path;
        this.name = raw.name;
    }
}
