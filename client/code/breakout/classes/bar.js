import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import { COLS, ROWS, BAR_WIDTH, BAR_HEIGHT } from 'code/breakout/constants/config';
import Figure from 'code/breakout/classes/figure';
import Ball from 'code/breakout/classes/ball';

const DIMENTION_RATIO = BAR_WIDTH / BAR_HEIGHT,
    LEFT_LIMIT = BAR_WIDTH / 2,
    RIGHT_LIMIT = COLS - LEFT_LIMIT,
    CENTER = ROWS + 1;

export default class Bar extends Figure {
    static default() {
        return new Bar(COLS / 2);
    }

    get left() {
        return this.pos.x - BAR_WIDTH / 2;
    }

    get right() {
        return this.pos.x + BAR_WIDTH / 2;
    }

    /// @override
    constructor(x: number) {
        super(new Vector(x, ROWS));
    }

    /// @override
    intersectionPoint(ball: Ball): Vector {
        return this.ellipseIntersection(ball);
    }

    ellipseIntersection(ball: Ball): Vector {
        const
            // Helper coefficients
            m = Math.tan(ball.angle),
            d = -m * ball.pos.x + ball.pos.y - CENTER,

            // Quadratic equation coefficients
            a = utils.sqr(1 / BAR_WIDTH) + utils.sqr(m / BAR_HEIGHT),
            b = 2 * (- this.pos.x / utils.sqr(BAR_WIDTH) + d * m / utils.sqr(BAR_HEIGHT)),
            c = utils.sqr(this.pos.x / BAR_WIDTH) + utils.sqr(d / BAR_HEIGHT) - 1,
            disc = utils.sqr(b) - 4 * a * c;

        if (disc < 0)
            return this.pos;

        // I'm too lazy to figure it out, so I brute-force it.
        return [1, -1]
            .map(rootSign => (-b + rootSign * Math.sqrt(disc)) / (2 * a))
            .map(root => {
                const x = utils.clam(root, this.left, this.right),
                    y = -BAR_HEIGHT * Math.sqrt(1 - Math.pow((ball.pos.x - this.pos.x) / BAR_WIDTH, 2)) + CENTER;

                return new Vector(x, y + 1 / 2);
            })
            .reduce((a, b) => ball.pos.distance(a) < ball.pos.distance(b) ? a : b);
    }

    /// @override
    reflection(ball: Ball): number {
        const normal = Math.atan2(DIMENTION_RATIO * (ball.pos.y - CENTER), ball.pos.x - this.pos.x);
        return utils.defaultAngle(2 * normal - (ball.angle + Math.PI));
    }

    move(amount: number) {
        this.pos.x = utils.clam(this.pos.x + amount, LEFT_LIMIT, RIGHT_LIMIT);
    }
}
