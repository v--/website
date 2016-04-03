import { ROWS, COLS } from 'code/breakout/constants/config';
import Rectangle from 'code/breakout/classes/rectangle';

export default class Grid extends Rectangle {
    /// @override
    constructor() {
        super({
            xCenter: COLS / 2,
            yCenter: ROWS / 2,

            top: 0,
            bottom: ROWS,
            left: 0,
            right: COLS
        });
    }
}
