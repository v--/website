export default class GPGKey {
    constructor(url) {
        const anchor = document.createElement('a');
        anchor.href = url;
        this.url = url;
        this.origin = anchor.origin || url;
        this.path = url.slice(this.origin.length);
    }
}
