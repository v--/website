import Bar from 'code/breakout/classes/bar';
import Ball from 'code/breakout/classes/ball';
import Block from 'code/breakout/classes/block';
import Grid from 'code/breakout/classes/grid';
import states from 'code/breakout/constants/states';

const store = {
    reset() {
        Object.assign(store, {
            state: states.PAUSED,
            score: 0,
            blocks: Block.default(),
            bar: Bar.default(),
            ball: Ball.default(),
            grid: Grid.default()
        });
    }
};

store.reset();
export default store;
