import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import { COLS, ROWS } from 'code/breakout/constants/config';

export default class StylePos {
    constructor(vector: Vector) {
        this.left = utils.percentize(vector.x / COLS);
        this.top = utils.percentize(vector.y / ROWS);
    }
}
