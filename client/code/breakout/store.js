import Bar from 'code/breakout/classes/bar';
import Ball from 'code/breakout/classes/ball';
import Block from 'code/breakout/classes/block';
import Grid from 'code/breakout/classes/grid';
import states from 'code/breakout/constants/states';
import { COLS, ROWS } from 'code/breakout/constants/config';

const store = {
    reset() {
        Object.assign(store, {
            state: states.PAUSED,
            score: 0,
            blocks: [new Block(COLS / 2, ROWS / 2 + 5, 2)],
            bar: new Bar(COLS / 2),
            ball: new Ball(COLS / 2, ROWS / 2 + 10, Math.PI / 2),
            grid: new Grid()
        });
    }
};

store.reset();
export default store;
