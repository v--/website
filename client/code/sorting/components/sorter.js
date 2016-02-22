import _ from 'lodash';

import utils from 'code/core/helpers/utils';
import classSet from 'code/core/helpers/classSet';
import Scheduler from 'code/core/helpers/scheduler';
import { Component, props, $ } from 'code/core/helpers/component';

const DEFAULT_STATE = {
    a: null,
    b: null,
    swap: null,
    ready: false
};

export default class Sorter extends Component {
    static propTypes = {
        name: props.string.isRequired,
        array: props.arrayOf(props.number).isRequired,
        period: props.number.isRequired,
        generator: props.func.isRequired
    };

    constructor() {
        super();
        this.dom = [];
        this.state = _.merge({ array: [] }, DEFAULT_STATE);
        this.scheduler = new Scheduler(10, ::this.sortIteration);
        this.subscribe('sorting:sort', 'onSort');
    }

    // @override
    render() {
        return $('div', { className: 'sort-demo-subsection sort-demo-sorter' },
            $('p', { className: 'sort-demo-heading' }, this.props.name),
            $('div', { className: 'sort-demo-lines' },
                _.map(this.state.array, ::this.drawLine)
            )
        );
    }

    // @override
    componentWillMount() {
        this.updateNativeState(this.props);
        this.setState({ array: _.clone(this.props.array) });
    }

    // @override
    onUnmount() {
        this.scheduler.stop();
    }

    // @override
    componentWillReceiveProps(props: Object) {
        this.updateNativeState(props);
        this.resetState({ array: _.clone(props.array) });
    }

    updateNativeState(props: Object) {
        this.scheduler.period = props.period;
    }

    resetState(config: Object = {}, callback = Function.identity) {
        this.scheduler.stop();
        this.setState(_.merge({}, DEFAULT_STATE, config), callback);
    }

    drawLine(value: number, index: number) {
        return $('div', {
            key: index,
            ref: _.partial(::this.updateLineElement, index),
            className: classSet(this.state.ready && 'ready'),
            style: {
                width: this.getWidth(value)
            }
        });
    }

    onSort(parentId) {
        if (this.props.parentId === parentId)
            this.sort();
    }

    sort() {
        this.resetState({ array: _.clone(this.props.array) }, () => {
            this.sortIter = this.props.generator(this.state.array);
            this.scheduler.start();
        });
    }

    getWidth(value) {
        return value * 100 / this.state.array.length + '%';
    }

    sortIteration() {
        const { done, value } = this.sortIter.next();

        if (done) {
            this.resetState({ ready: true });
            return;
        }

        const nodeA = this.dom[value.a],
            nodeB = this.dom[value.b];

        if (this.state.a)
            this.dom[this.state.a].className = '';

        if (this.state.b)
            this.dom[this.state.b].className = '';

        if (value.swap) {
            utils.swap(this.state.array, value.a, value.b);
            nodeA.className = nodeB.className = 'swapped';
        } else {
            nodeA.className = nodeB.className = 'still';
        }

        nodeA.style.width = this.getWidth(this.state.array[value.a]);
        nodeB.style.width = this.getWidth(this.state.array[value.b]);

        _.merge(this.state, value);
    }

    updateLineElement(id, element) {
        this.dom[id] = element;
    }
}
