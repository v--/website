import utils from 'code/core/helpers/utils';

export default class Vector {
    static null = new Vector(0, 0);

    static xReflect(angle: number) {
        return -utils.defaultAngle(Math.PI + angle);
    }

    static yReflect(angle: number) {
        return -angle;
    }

    static fromPolar(length: number, angle: number): Vector {
        return new Vector(length * Math.cos(angle), length * Math.sin(angle));
    }

    static sum(a: Vector, b: Vector): Vector {
        return new Vector(a.x + b.x, a.y + b.y);
    }

    static distance(a: Vector, b: Vector): number {
        return Math.sqrt(utils.sqr(b.x - a.x) + utils.sqr(b.y - a.y));
    }

    static angle(a: Vector, b: Vector): number {
        return Math.atan2(b.y - a.y, b.x - a.x);
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(addend: Vector) {
        this.x += addend.x;
        this.y += addend.y;
        return this;
    }

    distance(vector: Vector): number {
        return Vector.distance(this, vector);
    }

    inverse(): Vector {
        return new Vector(-this.x, -this.y);
    }
}
