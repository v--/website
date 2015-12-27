import { createElement, Component, PropTypes } from 'react';

import Dispatcher from 'code/helpers/dispatcher';
import { STATES } from 'code/constants/breakout';

export default class BreakoutScore extends Component {
    static propTypes = {
        stateDispatcher: PropTypes.instanceOf(Dispatcher).isRequired
    }

    constructor() {
        super();
        this.state = {};
        this.unregStateListener = null;
    }

    // @override
    render() {
        return createElement('h2', null,
            createElement('b', null, 'Score: '),
            this.state.score,
            this.state.message && ` (${this.state.message})`
        );
    }

    // @override
    componentWillMount() {
        this.unregStateListener = this.props.stateDispatcher.register(::this.updateState);
    }

    // @override
    componentWillReceiveProps(props: Object) {
        if (this.props.stateDispatcher !== props.stateDispatcher && this.unregStateListener !== null) {
            this.unregStateListener();
            this.unregStateListener = props.stateDispatcher.register(::this.updateState);
        }
    }

    // @override
    componentWillUnmount() {
        if (this.unregStateListener !== null)
            this.unregStateListener();
    }

    updateState(state: number) {
        switch (state) {
        case STATES.initial: this.setState({ score: 0, message: 'spacebar to start' }); break;
        case STATES.score: this.setState({ score: this.state.score + 1 }); break;
        case STATES.paused: this.setState({ message: 'spacebar to resume' }); break;
        case STATES.running: this.setState({ message: 'spacebar to pause' }); break;
        case STATES.stopped: this.setState({ message: 'spacebar to restart' }); break;
        }
    }
}
