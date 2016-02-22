import _ from 'lodash';

import mediator from 'code/core/helpers/mediator';
import Scheduler from 'code/core/helpers/scheduler';
import * as Keycodes from 'code/core/constants/keycodes';
import { Component, props, $ } from 'code/core/helpers/component';

import Matrix from 'code/breakout/helpers/matrix';
import Block from 'code/breakout/components/block';
import Ball from 'code/breakout/components/ball';
import { LEVEL_COUNT, INITIAL_COUNT, BAR_WIDTH, EVOLUTION_INTERVAL, STATES } from 'code/breakout/constants/config';

function laplaceGenerator(mu: number, sigma: number) {
    const value = Math.random();
    let result;

    if (value < 1 / 2)
        result = Math.log(2 * value);
    else
        result = -Math.log(2 * (1 - value));

    return Math.round(_.clamp(mu + result, mu - sigma, mu + sigma));
}

export default class Grid extends Component {
    static propTypes = {
        blockSize: props.number.isRequired,
        m: props.number.isRequired,
        n: props.number.isRequired
    }

    constructor() {
        super();
        this.gameState = 0;
        this.barStart = 0;
        this.scheduler = new Scheduler(EVOLUTION_INTERVAL, ::this.evolve);
        this.subscribe('breakout:block', 'updateBlock');
        this.subscribe('breakout:state', 'updateState');
        this.subscribe('key:down', 'onKeyDown');
    }

    // @override
    render() {
        const { blockSize } = this.props;

        return $('div', { className: 'breakout-grid-container' },
            $('div',
                {
                    className: 'breakout-grid',
                    style: {
                        width: blockSize * this.props.n,
                        height: blockSize * this.props.m
                    }
                },

                _.times(this.props.m * this.props.n, i =>
                    $(Block, {
                        key: i,
                        m: this.state.grid.m,
                        n: this.state.grid.n,
                        block: this.state.grid.payload[i],
                        blockSize: blockSize
                    })
                ),

                $(Ball, {
                    grid: this.state.grid,
                    blockSize: blockSize
                })
            )
        );
    }

    // @override
    componentDidMount() {
        mediator.emit('breakout:bar', this.barStart);
    }

    // @override
    componentWillMount() {
        this.barStart = Math.round((this.props.n - BAR_WIDTH) / 2);
        this.createMatrix(this.props.m, this.props.n);
    }

    // @override
    componentWillReceiveProps(props: Object) {
        if (this.props.m !== props.m || this.props.n !== props.n) {
            this.barStart = Math.round((props.n - BAR_WIDTH) / 2);
            this.createMatrix(props.m, props.n);
            this.scheduler.start();
        }
    }

    // @override
    onUnmount() {
        this.scheduler.stop();
    }

    onKeyDown(e) {
        let newStart;

        if (e.altKey || e.ctrlKey || e.shiftKey)
            return;

        switch (e.keyCode) {
        case Keycodes.SPACEBAR:

            if (this.scheduler.isRunning) {
                mediator.emit('breakout:state', STATES.paused);
            } else if (this.gameState === STATES.paused) {
                mediator.emit('breakout:state', STATES.running);
            } else {
                mediator.emit('breakout:state', STATES.initial);
                mediator.emit('breakout:state', STATES.running);
            }

            e.preventDefault();
            break;

        case Keycodes.LEFT:
            if (this.gameState === STATES.paused)
                return;

            newStart = Math.max(0, this.barStart - 1);
            mediator.emit('breakout:bar', newStart, this.barStart);
            this.barStart = newStart;
            e.preventDefault();
            break;

        case Keycodes.RIGHT:
            if (this.gameState === STATES.paused)
                return;

            newStart = Math.min(this.props.n - BAR_WIDTH, this.barStart + 1);
            mediator.emit('breakout:bar', newStart, this.barStart);
            this.barStart = newStart;
            e.preventDefault();
            break;
        }
    }

    updateBlock(i, j, value, oldValue) {
        if (value >= 0 && value < oldValue)
            mediator.emit('breakout:state', STATES.score);

        this.state.grid.set(i, j, value);
    }

    updateState(state: number) {
        this.gameState = state;

        switch (state) {
        case STATES.running:
            this.scheduler.start();
            break;

        case STATES.paused:
            this.scheduler.stop();
            break;

        case STATES.stopped:
            this.scheduler.stop();
            this.createMatrix(this.props.m, this.props.n);
            mediator.emit('breakout:bar', this.barStart);
            break;
        }
    }

    evolve() {
        const organisms = _.values(this.state.grid.organisms);

        if (_.isEmpty(organisms)) {
            this.scheduler.stop();
            return;
        }

        let chosen = organisms[_.random(0, organisms.length - 1)],
            selected = this.state.grid.get(
                _.clamp(laplaceGenerator(chosen.i, 1), 0, this.props.m - 1),
                _.clamp(laplaceGenerator(chosen.j, 1), 0, this.props.n - 1)
            );

        mediator.emit('breakout:block', selected.i, selected.j, selected.value + 1, selected.value);
    }

    createMatrix(m: number, n: number) {
        const dividedWidth = n / INITIAL_COUNT / 2, dividedHeight = m / 4;
        let grid = new Matrix(m, n);

        _.times(INITIAL_COUNT, i => {
            const row = laplaceGenerator(dividedHeight, dividedHeight),
                  col = laplaceGenerator(dividedWidth + 2 * i * dividedWidth, dividedWidth);

            grid.set(row, col, LEVEL_COUNT);
        });

        this.setState({
            grid: grid
        });
    }
}
