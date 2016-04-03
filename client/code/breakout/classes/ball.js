import { COLS, ROWS, BALL_RADIUS } from 'code/breakout/constants/config';
import Vector from 'code/core/classes/vector';

export default class Ball {
    static default() {
        return new Ball(new Vector(COLS / 2, ROWS / 2 + 1), Math.PI / 2);
    }

    get front() {
        return Vector.fromPolar(BALL_RADIUS, this.angle).add(this.pos);
    }

    get back() {
        return Vector.fromPolar(-BALL_RADIUS, this.angle).add(this.pos);
    }

    constructor(pos: Vector, angle: number) {
        this.pos = pos;
        this.angle = angle;
    }

    move(amount: number) {
        this.pos.add(Vector.fromPolar(amount, this.angle));
    }
}
