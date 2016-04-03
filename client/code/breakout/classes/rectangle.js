import Vector from 'code/core/classes/vector';
import utils from 'code/core/helpers/utils';

import Figure from 'code/breakout/classes/figure';

type RectangleConfig = {
    xCenter: number,
    yCenter: number,
    left: number,
    right: number,
    top: number,
    bottom: number
}

export default class Rectangle extends Figure {
    constructor(config: RectangleConfig) {
        super(config.xCenter, config.yCenter);

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
    intersectionPoint(point: Vector, _angle: number): Vector {
        const centralAngle = Vector.angle(this.pos, point);

        if (this.inTopSector(centralAngle))
            return new Vector(point.x, this.top);

        if (this.inBottomSector(centralAngle))
            return new Vector(point.x, this.bottom);

        if (this.inRightSector(centralAngle))
            return new Vector(this.right, point.y);

        return new Vector(this.left, point.y);
    }

    /// @override
    reflection(point: Vector, angle: number): number {
        const centralAngle = Vector.angle(this.pos, point);

        if (this.inTopSector(centralAngle) || this.inBottomSector(centralAngle))
            return Vector.yReflect(angle);
        else
            return Vector.xReflect(angle);
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
