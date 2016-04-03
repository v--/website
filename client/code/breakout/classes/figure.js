import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import { COLS, ROWS } from 'code/breakout/constants/config';
import Intersection from 'code/breakout/classes/intersection';
import Ball from 'code/breakout/classes/ball';

const EPSILON = 0.001;

export default class Figure {
    constructor(pos: Vector) {
        pre: {
            utils.isBetween(pos.x, 0, COLS);
            utils.isBetween(pos.y, 0, ROWS);
        }

        this.pos = pos;
    }

    intersectionPoint(_point: Vector, _angle: number) {
        pre: this.constructor !== Figure;
    }

    reflection(_ball: Ball) {
        pre: this.constructor !== Figure;
    }

    intersection(ball: Ball) {
        const intersection = this.intersectionPoint(ball),
            distance = ball.pos.distance(intersection),
            reflection = this.reflection(ball),
            prev = Vector.fromPolar(-EPSILON, ball.angle).add(ball.pos),
            direction = distance < prev.distance(intersection);

        return new Intersection(this, intersection, reflection, direction ? distance : Infinity);
    }
}
