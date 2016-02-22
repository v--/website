import _ from 'lodash';

import mediator from 'code/core/helpers/mediator';
import Scheduler from 'code/core/helpers/scheduler';
import { Component, props, $ } from 'code/core/helpers/component';

import Matrix from 'code/breakout/helpers/matrix';
import { BAR_WIDTH, RENDER_INTERVAL, MOVE_SIZE_QUOTENT, STATES } from 'code/breakout/constants/config';

function euclideanDistance(y1, y2, x1, x2) {
    return Math.sqrt((y1 - y2) * (y1 - y2) + (x1 - x2) * (x1 - x2));
}

export default class BreakoutBall extends Component {
    static propTypes = {
        grid: props.instanceOf(Matrix).isRequired,
        blockSize: props.number.isRequired
    }

    constructor() {
        super();
        this.scheduler = new Scheduler(RENDER_INTERVAL, ::this.move);
        this.barStart = 0;
        this.state = { left: 0, right: 0 };
        this.resetAngle();
    }

    // @override
    render() {
        return $('div', {
            className: 'breakout-ball',
            style: {
                width: this.props.blockSize,
                height: this.props.blockSize,
                left: this.state.left,
                top: this.state.top
            }
        });
    }

    // @override
    componentWillMount() {
        this.setTotalSize(this.props.grid, this.props.blockSize);
        this.subscribe('breakout:bar', 'updateBar');
        this.subscribe('breakout:state', 'updateState');
    }

    // @override
    componentWillReceiveProps(props: Object) {
        this.setTotalSize(props.grid, props.blockSize);
        const sizeRatio = props.blockSize / this.props.blockSize;

        if (sizeRatio !== 1) {
            this.setState({
                left: sizeRatio * this.state.left,
                top: sizeRatio * this.state.top
            });
        }

        if (this.props.m !== props.m || this.props.n !== props.n) {
            this.updateBar(Math.round(props.n / 2));
            this.positionInitially(props.grid, props.blockSize);
            this.scheduler.start();
        }
    }

    // @override
    onUnmount() {
        this.scheduler.stop();
    }

    setTotalSize(grid, blockSize) {
        this.totalWidth = blockSize * grid.n;
        this.totalHeight = blockSize * grid.m;
    }

    updateState(state: number) {
        switch (state) {
        case STATES.running:
            this.scheduler.start();
            break;

        case STATES.paused:
            this.scheduler.stop();
            break;

        case STATES.stopped:
            this.scheduler.stop();
            this.resetAngle();
            this.updateBar(this.barStart);
            break;
        }
    }

    updateBar(newStart: number, oldStart: number = newStart) {
        this.barStart = newStart;

        if (this.scheduler.isRunning)
            return;

        let newPosition = newStart + this.state.left / this.props.blockSize - oldStart;

        if (this.props.grid.get(this.props.grid.m - 1, Math.round(newPosition)).value !== -1)
            newPosition = newStart + (BAR_WIDTH - 1) / 2;

        this.setState({
            top: (this.props.grid.m - 2) * this.props.blockSize,
            left: newPosition * this.props.blockSize
        });
    }

    resetAngle() {
        this.angle = 5 / 8 * Math.PI;
    }

    verticalReflection() {
        this.angle = 2 * Math.PI - this.angle;
    }

    horizontalReflection() {
        this.angle = Math.PI - this.angle % 2 * Math.PI;
    }

    move() {
        const { blockSize } = this.props;

        if (this.state.top / blockSize > this.props.grid.m - 2) {
            mediator.emit('breakout:state', STATES.stopped);
            return;
        } else if (this.state.top === 0) {
            this.verticalReflection();
        } else if (this.state.left === 0 || this.state.left === this.totalWidth - blockSize) {
            this.horizontalReflection();
        }

        const left = _.clamp(this.state.left + blockSize * MOVE_SIZE_QUOTENT * Math.cos(this.angle), 0, this.totalWidth - blockSize),
            top = _.clamp(this.state.top + blockSize * MOVE_SIZE_QUOTENT * Math.sin(this.angle), 0, this.totalHeight - blockSize);

        const blocks = _.times(4, i => this.props.grid.get(
            Math[i === 0 || i === 1 ? 'floor' : 'ceil'](top / blockSize),
            Math[i === 0 || i === 2 ? 'ceil' : 'floor'](left / blockSize)
        ));

        if (_.every(blocks, _.matches({ value: 0 }))) {
            this.setState({
                left: left,
                top: top
            });
        } else {
            const topCenter = top / blockSize + 1 / 2,
                  leftCenter = left / blockSize + 1 / 2,
                  nearest = _(blocks)
                      .reject(_.matches({ value: 0 }))
                      .minBy(b => euclideanDistance(topCenter, leftCenter, b.i, b.j));

            mediator.emit('breakout:block', nearest.i, nearest.j, nearest.value - 1, nearest.value);

            if (Math.abs(this.state.left - left) < Math.abs(this.state.top - top))
                this.verticalReflection();
            else
                this.horizontalReflection();
        }
    }
}
