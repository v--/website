import _ from 'lodash';

import { LEVEL_COUNT } from 'code/breakout/constants/config';

export class Block {
    constructor(i: number, j: number, value) {
        this.i = i;
        this.j = j;
        this.value = value;
    }
}

export default class Grid {
    constructor(m: number, n: number) {
        this.m = m;
        this.n = n;
        this.organisms = {};
        this.payload = new Array(m * n);

        for (let i = 0; i < m; ++i)
            for (let j = 0; j < n; ++j)
                this.payload[i * n + j] = new Block(i, j, 0);
    }

    get(i: number, j: number) {
        return this.payload[i * this.n + j];
    }

    set(i: number, j: number, value) {
        const index = i * this.n + j,
              clamped = _.clamp(value, 0, LEVEL_COUNT);

        this.payload[index].value = value < -1 ? value + 1 : clamped;

        if (value === -2)
            return;
        if (clamped === 0)
            delete this.organisms[index];
        else
            this.organisms[index] = this.payload[index];
    }
}
