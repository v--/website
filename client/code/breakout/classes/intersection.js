import Vector from 'code/core/classes/vector';

export default class Intersection {
    constructor(object: any, pos: Vector, reflection: number, distance: number) {
        this.object = object;
        this.pos = pos;
        this.reflection = reflection;
        this.distance = distance;
    }
}
