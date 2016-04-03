import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import { COLS, LEVEL_COUNT, INITIAL_BLOCKS, BLOCK_SIDE, BLOCK_Y_LIMIT } from 'code/breakout/constants/config';
import Rectangle from 'code/breakout/classes/rectangle';
import laplaceRandom from 'code/breakout/helpers/laplaceRandom';

const BLOCK_WIDTH_VARIATION = Math.floor(COLS / INITIAL_BLOCKS / 2);

export default class Block extends Rectangle {
    static default(): Block[] {
        return utils.times(INITIAL_BLOCKS, function(num) {
            const medianCol = Math.round(COLS * num / INITIAL_BLOCKS) + BLOCK_WIDTH_VARIATION,
                availableHeight = Math.floor(BLOCK_Y_LIMIT / 2),
                col = laplaceRandom.halved(medianCol, BLOCK_WIDTH_VARIATION),
                row = laplaceRandom.halved(availableHeight, availableHeight);

            return new Block(col, row, LEVEL_COUNT);
        });
    }

    /// @override
    constructor(col: number, row: number, value: number = 1) {
        super({
            pos: new Vector(col + BLOCK_SIDE / 2, row + BLOCK_SIDE / 2),
            top: row,
            bottom: row + BLOCK_SIDE,
            left: col,
            right: col + BLOCK_SIDE
        });

        this.updateValue(value);
    }

    updateValue(value: number) {
        this.value = utils.clam(0, value, LEVEL_COUNT);
    }

    evolve() {
        this.updateValue(this.value + 1);
    }

    devolve() {
        this.updateValue(this.value - 1);
    }
}
