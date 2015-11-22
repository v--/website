export default class Contact {
    constructor(name: string, icon: string, uri: string) {
        this.merge({ name, icon, uri });
    }

    get faIcon() {
        return `fa-${this.icon}`;
    }
}
