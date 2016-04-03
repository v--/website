import utils from 'code/core/helpers/utils';

import { LEVEL_COUNT, BLOCK_SIDE } from 'code/breakout/constants/config';
import Rectangle from 'code/breakout/classes/rectangle';

export default class Block extends Rectangle {
    /// @override
    constructor(row: number, col: number, value: number) {
        super({
            xCenter: row + BLOCK_SIDE / 2,
            yCenter: col + BLOCK_SIDE / 2,

            top: row,
            bottom: row + BLOCK_SIDE,
            left: col,
            right: col + BLOCK_SIDE
        });

        this.value = utils.clam(0, value, LEVEL_COUNT);
    }
}
