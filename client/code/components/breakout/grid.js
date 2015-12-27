import { createElement, Component, PropTypes } from 'react';

import BreakoutBlock from 'code/components/breakout/block';
import BreakoutBall from 'code/components/breakout/ball';
import Dispatcher from 'code/helpers/dispatcher';
import Scheduler from 'code/helpers/scheduler';
import Grid from 'code/helpers/grid';
import * as Keycodes from 'code/constants/keycodes';
import { LEVEL_COUNT, INITIAL_COUNT, BAR_WIDTH, EVOLUTION_INTERVAL, STATES } from 'code/constants/breakout';

function laplaceGenerator(mu: number, sigma: number) {
    const value = Math.random();
    let result;

    if (value < 1 / 2)
        result = Math.log(2 * value);
    else
        result = - Math.log(2 * (1 - value));

    return (mu + result).clamp(mu - sigma, mu + sigma).round();
}

export default class BreakoutGrid extends Component {
    static propTypes = {
        stateDispatcher: PropTypes.instanceOf(Dispatcher).isRequired,
        blockSize: PropTypes.number.isRequired,
        m: PropTypes.number.isRequired,
        n: PropTypes.number.isRequired
    }

    constructor() {
        super();
        this.gameState = 0;
        this.barStart = 0;
        this.scheduler = new Scheduler(EVOLUTION_INTERVAL, ::this.evolve);
        this.dispatcher = new Dispatcher();
        this.barDispatcher = new Dispatcher();
        this.unregDispatcher = this.dispatcher.register(::this.updateBlock);
        this.unregKeyDownListener = Dispatcher.keyDown.register(::this.onKeyDown);
    }

    // @override
    render() {
        const { blockSize } = this.props;

        return createElement('div', { className: 'breakout-grid-container' },
            createElement('div',
                {
                    className: 'breakout-grid',
                    style: {
                        width: blockSize * this.props.n,
                        height: blockSize * this.props.m
                    }
                },

                Array.generate(this.props.m * this.props.n, i =>
                    createElement(BreakoutBlock, {
                        key: i,
                        m: this.state.grid.m,
                        n: this.state.grid.n,
                        block: this.state.grid.payload[i],
                        blockSize: blockSize,
                        dispatcher: this.dispatcher,
                        barDispatcher: this.barDispatcher
                    })
                ),

                createElement(BreakoutBall, {
                    grid: this.state.grid,
                    blockSize: blockSize,
                    dispatcher: this.dispatcher,
                    barDispatcher: this.barDispatcher,
                    stateDispatcher: this.props.stateDispatcher
                })
            )
        )
    }

    // @override
    componentDidMount() {
        this.barDispatcher.dispatch(this.barStart);
    }

    // @override
    componentWillMount() {
        this.barStart = Math.round((this.props.n - BAR_WIDTH) / 2);
        this.createGrid(this.props.m, this.props.n);
        this.unregStateDispatcher = this.props.stateDispatcher.register(::this.updateState);
    }

    // @override
    componentWillReceiveProps(props: Object) {
        if (this.props.m !== props.m || this.props.n !== props.n) {
            this.barStart = Math.round((props.n - BAR_WIDTH) / 2);
            this.createGrid(props.m, props.n);
            this.scheduler.start();
        }

        if (this.props.stateDispatcher !== props.stateDispatcher && this.unregStateDispatcher !== null) {
            this.unregStateDispatcher();
            this.unregStateDispatcher = this.props.stateDispatcher.register(::this.updateState);
        }
    }

    // @override
    componentWillUnmount() {
        this.scheduler.stop();

        if (this.unregDispatcher !== null)
            this.unregDispatcher();

        if (this.unregStateDispatcher !== null)
            this.unregStateDispatcher();

        if (this.unregKeyDownListener !== null)
            this.unregKeyDownListener();
    }

    onKeyDown(e) {
        let newStart;

        if (e.altKey || e.ctrlKey || e.shiftKey)
            return;

        switch (e.keyCode) {
        case Keycodes.SPACEBAR:

            if (this.scheduler.isRunning) {
                this.props.stateDispatcher.dispatch(STATES.paused);
            } else if (this.gameState === STATES.paused) {
                this.props.stateDispatcher.dispatch(STATES.running);
            } else {
                this.props.stateDispatcher.dispatch(STATES.initial);
                this.props.stateDispatcher.dispatch(STATES.running);
            }

            e.preventDefault();
            break;

        case Keycodes.LEFT:
            if (this.gameState === STATES.paused)
                return;

            newStart = Math.max(0, this.barStart - 1);
            this.barDispatcher.dispatch(newStart, this.barStart);
            this.barStart = newStart;
            e.preventDefault();
            break;

        case Keycodes.RIGHT:
            if (this.gameState === STATES.paused)
                return;

            newStart = Math.min(this.props.n - BAR_WIDTH, this.barStart + 1);
            this.barDispatcher.dispatch(newStart, this.barStart);
            this.barStart = newStart;
            e.preventDefault();
            break;
        }
    }

    updateBlock(i, j, value, oldValue) {
        if (value >= 0 && value < oldValue)
            this.props.stateDispatcher.dispatch(STATES.score);

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
            this.createGrid(this.props.m, this.props.n);
            this.barDispatcher.dispatch(this.barStart);
            break;
        }
    }

    evolve() {
        const organisms = this.state.grid.organisms.values();

        if (organisms.isEmpty()) {
            this.scheduler.stop();
            return;
        }

        let chosen = organisms[Number.random(0, organisms.length - 1)],
            selected = this.state.grid.get(
                laplaceGenerator(chosen.i, 1).clamp(0, this.props.m - 1),
                laplaceGenerator(chosen.j, 1).clamp(0, this.props.n - 1)
            );

        this.dispatcher.dispatch(selected.i, selected.j, selected.value + 1, selected.value);
    }

    createGrid(m: number, n: number) {
        const dividedWidth = n / INITIAL_COUNT / 2, dividedHeight = m / 4;
        let grid = new Grid(m, n);

        INITIAL_COUNT.times(i => {
            const row = laplaceGenerator(dividedHeight, dividedHeight),
                  col = laplaceGenerator(dividedWidth + 2 * i * dividedWidth, dividedWidth);

            grid.set(row, col, LEVEL_COUNT);
        });

        this.setState({
            grid: grid
        });
    }
}
