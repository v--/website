import { Component, props, $ } from 'code/core/helpers/component';
import { BAR_WIDTH } from 'code/breakout/constants/config';

export default class Block extends Component {
    static propTypes = {
        m: props.number.isRequired,
        n: props.number.isRequired,
        block: props.instanceOf(Object).isRequired,
        blockSize: props.number.isRequired
    }

    constructor() {
        super();
        this.subscribe('breakout:block', 'updateBlock');
        this.subscribe('breakout:bar', 'updateBar');
    }

    // @override
    render() {
        return $('div', {
            className: `breakout-block-${this.props.block.value}`,
            style: {
                height: this.props.blockSize,
                width: this.props.blockSize
            }
        });
    }

    updateBlock(i, j, value, oldValue) {
        if (i === this.props.block.i && j === this.props.block.j && value !== oldValue)
            this.forceUpdate();
    }

    updateBar(newStart: number) {
        const block = this.props.block;

        if (block.i === this.props.m - 1) {
            if (block.j >= newStart && block.j < newStart + BAR_WIDTH)
                block.value = -1;
            else
                block.value = 0;

            this.forceUpdate();
        }
    }
}
