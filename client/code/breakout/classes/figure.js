import Vector from 'code/core/classes/vector';

import { BALL_RADIUS, COLS, ROWS } from 'code/breakout/constants/config';
import Intersection from 'code/breakout/classes/intersection';

export default class Figure {
    get unitPos() {
        return new Vector(this.pos.x / COLS, this.pos.y / ROWS);
    }

    constructor(x: number, y: number) {
        this.pos = new Vector(x, y);
    }

    intersectionPoint(_point: Vector, _angle: number) {
        pre: this.constructor !== Figure;
    }

    reflection(_point: Vector, _angle: number) {
        pre: this.constructor !== Figure;
    }

    intersection(point: Vector, angle: number) {
        const intersection = this.intersectionPoint(point, angle),
            distance = intersection.distance(point),
            reflection = this.reflection(point, angle),
            back = Vector.fromPolar(BALL_RADIUS, Vector.xReflect(angle)).add(point),
            direction = distance < back.distance(intersection);

        return new Intersection(intersection, reflection, direction ? distance : Infinity);
    }
}
