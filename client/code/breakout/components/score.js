import { Component, $ } from 'code/core/helpers/component';
import { STATES } from 'code/breakout/constants/config';

export default class Score extends Component {
    constructor() {
        super();
        this.state = {};
        this.subscribe('breakout:state', 'updateState');
    }

    // @override
    render() {
        return $('h2', null,
            $('b', null, 'Score: '),
            this.state.score,
            this.state.message && ` (${this.state.message})`
        );
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
