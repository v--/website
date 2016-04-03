import { BALL_RADIUS } from 'code/breakout/constants/config';
import Vector from 'code/core/classes/vector';
import Figure from 'code/breakout/classes/figure';

export default class Ball extends Figure {
    get front() {
        return Vector.fromPolar(BALL_RADIUS, this.angle).add(this.pos);
    }

    constructor(x: number, y: number, angle: number) {
        super(x, y);
        this.angle = angle;
    }

    move(amount: number) {
        this.pos.add(Vector.fromPolar(amount, this.angle));
    }
}
