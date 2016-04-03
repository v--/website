import Vector from 'code/core/classes/vector';

export default class Intersection {
    constructor(pos: Vector, reflection: number, distance: number) {
        this.pos = pos;
        this.reflection = reflection;
        this.distance = distance;
    }
}
