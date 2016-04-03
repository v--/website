import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import Figure from 'code/breakout/classes/figure';
import Ball from 'code/breakout/classes/ball';

type RectangleConfig = {
    pos: Vector,
    left: number,
    right: number,
    top: number,
    bottom: number
}

export default class Rectangle extends Figure {
    constructor(config: RectangleConfig) {
        super(config.pos);

        this.top = config.top;
        this.bottom = config.bottom;
        this.left = config.left;
        this.right = config.right;

        this.topLeft = Vector.angle(this.pos, Vector.null),
        this.topRight = Vector.xReflect(this.topLeft),
        this.bottomLeft = Vector.yReflect(this.topLeft),
        this.bottomRight = Vector.yReflect(this.topRight);
    }

    /// @override
    intersectionPoint(ball: Ball): Vector {
        const centralAngle = Vector.angle(this.pos, ball.pos);

        if (this.inTopSector(centralAngle))
            return new Vector(utils.clam(ball.pos.x, this.left, this.right), this.top);

        if (this.inBottomSector(centralAngle))
            return new Vector(utils.clam(ball.pos.x, this.left, this.right), this.bottom);

        if (this.inRightSector(centralAngle))
            return new Vector(this.right, utils.clam(ball.pos.y, this.top, this.bottom));

        return new Vector(this.left, utils.clam(ball.pos.y, this.top, this.bottom));
    }

    /// @override
    reflection(ball: Ball): number {
        const centralAngle = Vector.angle(this.pos, ball.pos);

        if (this.inTopSector(centralAngle) || this.inBottomSector(centralAngle))
            return Vector.yReflect(ball.angle);
        else
            return Vector.xReflect(ball.angle);
    }

    inTopSector(angle: number): boolean {
        return utils.isBetween(angle, this.topLeft, this.topRight);
    }

    inBottomSector(angle: number): boolean {
        return utils.isBetween(angle, this.bottomRight, this.bottomLeft);
    }

    inLeftSector(angle: number): boolean {
        return utils.isBetween(angle, this.bottomLeft, Math.PI) ||
            utils.isBetween(angle, -Math.PI, this.topLeft);
    }

    inRightSector(angle: number): boolean {
        return utils.isBetween(angle, this.topRight, this.bottomRight);
    }
}
