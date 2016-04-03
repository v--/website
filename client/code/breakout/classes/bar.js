import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import { COLS, ROWS, BAR_WIDTH, BAR_HEIGHT } from 'code/breakout/constants/config';
import Figure from 'code/breakout/classes/figure';

const DIMENTION_RATIO = BAR_WIDTH / BAR_HEIGHT,
    ANGLE_INVERSION_TRESHOLD = 0.1,
    LEFT_LIMIT = BAR_WIDTH / 2,
    RIGHT_LIMIT = COLS - LEFT_LIMIT,
    TOP = COLS - BAR_HEIGHT / 2,
    BOTTOM = COLS;

export default class Bar extends Figure {
    get left() {
        return this.pos.x - BAR_WIDTH / 2;
    }

    get right() {
        return this.pos.x + BAR_WIDTH / 2;
    }

    /// @override
    constructor(x: number) {
        super(x, ROWS + 1.5); // TODO: Why not 1?
    }

    /// @override
    intersectionPoint(point: Vector, angle: number): Vector {
        if (Math.abs(angle) < ANGLE_INVERSION_TRESHOLD)
            return new Vector(this.left, utils.clam(point.y, TOP, BOTTOM));

        if (Math.abs(Math.PI - angle) < ANGLE_INVERSION_TRESHOLD)
            return new Vector(this.right, utils.clam(point.y, TOP, BOTTOM));

        return this.ellipseIntersection(point, angle);
    }

    ellipseIntersection(point: Vector, angle: number): Vector {
        const
            // Helper coefficients
            m = Math.tan(angle),
            d = -m * point.x + point.y - this.pos.y,

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
                    y = -BAR_HEIGHT * Math.sqrt(1 - Math.pow((point.x - this.pos.x) / BAR_WIDTH, 2)) + this.pos.y;

                return new Vector(x, y);
            })
            .reduce((a, b) => point.distance(a) < point.distance(b) ? a : b);
    }

    /// @override
    reflection(point: Vector, angle: number): number {
        if (Math.abs(angle) < ANGLE_INVERSION_TRESHOLD || Math.abs(Math.PI - angle) < ANGLE_INVERSION_TRESHOLD)
            return Vector.xReflect(angle);

        const normal = Math.atan2(DIMENTION_RATIO * (point.y - this.pos.y), point.x - this.pos.x);
        return utils.defaultAngle(2 * normal - (angle + Math.PI));
    }

    move(amount: number) {
        this.pos.x = utils.clam(this.pos.x + amount, LEFT_LIMIT, RIGHT_LIMIT);
    }
}
