import Vector from 'code/core/classes/vector';

import { ROWS, COLS } from 'code/breakout/constants/config';
import Rectangle from 'code/breakout/classes/rectangle';

export default class Grid extends Rectangle {
    static default() {
        return new Grid();
    }

    /// @override
    constructor() {
        super({
            pos: new Vector(COLS / 2, ROWS / 2),
            top: 0,
            bottom: ROWS,
            left: 0,
            right: COLS
        });
    }
}
