import _ from 'lodash';

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
        _.merge(this, { left, top, right, bottom, width, height });
    }

    clone() {
        return new Viewport(this);
    }
}
