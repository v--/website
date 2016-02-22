import _ from 'lodash';

export default class Contact {
    constructor(name: string, icon: string, uri: string) {
        _.merge(this, { name, icon, uri });
    }

    get faIcon() {
        return `fa-${this.icon}`;
    }
}
