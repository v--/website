import { createElement, Component, PropTypes } from 'react';

import classSet from 'code/helpers/classSet';
import Dispatcher from 'code/helpers/dispatcher';
import Scheduler from 'code/helpers/scheduler';

const DEFAULT_STATE = {
    a: null,
    b: null,
    swap: null,
    ready: false
};

export default class SortDemoSorter extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        array: PropTypes.arrayOf(PropTypes.number).isRequired,
        period: PropTypes.number.isRequired,
        sortDispatcher: PropTypes.instanceOf(Dispatcher).isRequired,
        // replace with instanceOf GeneratorFunction
        generator: PropTypes.func.isRequired
    }

    constructor() {
        super();
        this.state = { array: [] }.merge(DEFAULT_STATE);
        this.scheduler = new Scheduler(10, ::this.sortIteration);
    }

    // @override
    render() {
        return createElement('div', { className: 'sort-demo-subsection sort-demo-sorter' },
            createElement('p', { className: 'sort-demo-heading' }, `${this.props.name}:`),
            createElement('div', null,
                this.state.array.map(::this.drawLine)
            )
        );
    }

    // @override
    componentWillMount() {
        this.updateNativeState(this.props);
        this.setState({ array: this.props.array.clone() });
    }

    // @override
    componentWillUnmount() {
        this.unregSort();
        this.scheduler.stop();
    }

    // @override
    componentWillReceiveProps(props: Object) {
        this.unregSort();
        this.updateNativeState(props);
        this.resetState({ array: props.array.clone() });
    }

    updateNativeState(props: Object) {
        this.unregSort = props.sortDispatcher.register(::this.sort);
        this.scheduler.period = props.period;
    }

    resetState(config: Object = {}, callback = Function.identity) {
        this.scheduler.stop();
        this.setState({}.merge(DEFAULT_STATE).merge(config), callback);
    }

    drawLine(value: number, index: number) {
        const isVictim = index === this.state.a || index === this.state.b && !this.state.ready;

        return createElement('div', {
            key: index,
            className: classSet(
                'sort-demo-line',
                this.state.ready && 'ready',
                isVictim && this.state.swap && 'swapped',
                isVictim && !this.state.swap && 'still'
            ),

            style: {
                width: value * 100 / this.state.array.length + '%'
            }
        });
    }

    sort() {
        this.resetState({ array: this.props.array.clone() }, () => {
            this.sortIter = this.props.generator(this.state.array);
            this.scheduler.start();
        });
    }

    sortIteration() {
        const { done, value } = this.sortIter.next();

        if (done) {
            this.resetState({ ready: true });
            return;
        }

        if (value.swap)
            this.state.array.swap(value.a, value.b);

        this.setState(value);
    }
}
