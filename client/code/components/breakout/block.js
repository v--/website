import { createElement, Component, PropTypes } from 'react';

import Dispatcher from 'code/helpers/dispatcher';
import Block from 'code/helpers/block';
import { BAR_WIDTH } from 'code/constants/breakout';

export default class BreakoutBlock extends Component {
    static propTypes = {
        m: PropTypes.number.isRequired,
        n: PropTypes.number.isRequired,
        block: PropTypes.instanceOf(Block),
        blockSize: PropTypes.number.isRequired,
        dispatcher: PropTypes.instanceOf(Dispatcher).isRequired,
        barDispatcher: PropTypes.instanceOf(Dispatcher).isRequired
    }

    // @override
    render() {
        return createElement('div', {
            className: `breakout-block-${this.props.block.value}`,
            style: {
                height: this.props.blockSize,
                width: this.props.blockSize
            }
        });
    }

    // @override
    componentWillMount() {
        this.unregListener = this.props.dispatcher.register(::this.updateBlock);
        this.unregBarListener = this.props.barDispatcher.register(::this.updateBar);
    }

    // @override
    componentWillReceiveProps(props: Object) {
        if (this.props.dispatcher !== props.dispatcher && this.unregListener !== null) {
            this.unregListener();
            this.unregListener = props.dispatcher.register(::this.updateBlock);
        }

        if (this.props.stateDispatcher !== props.stateDispatcher && this.unregBarListener !== null) {
            this.unregBarListener();
            this.unregBarListener = props.barDispatcher.register(::this.updateBar);
        }
    }

    // @override
    componentWillUnmount() {
        if (this.unregListener !== null)
            this.unregListener();

        if (this.unregBarListener !== null)
            this.unregBarListener();
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
