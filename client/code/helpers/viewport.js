export default class Viewport {
    static default = new Viewport({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0
    });

    constructor(rect: Object) {
        const { left, top, right, bottom, width, height } = rect;
        this.merge({ left, top, right, bottom, width, height });
    }
}
