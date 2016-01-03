import { createElement } from 'react';

import viewTemplate from 'views/code/breakout';
import View from 'code/helpers/view';
import Dispatcher from 'code/helpers/dispatcher';
import Jade from 'code/components/jade';
import BreakoutGrid from 'code/components/breakout/grid';
import BreakoutScore from 'code/components/breakout/score';
import { BREAKOUT_PADDING } from 'code/constants/style';
import { GRID_WIDTH, GRID_HEIGHT, STATES } from 'code/constants/breakout';

export default class CodeBreakout extends View {
    // @override
    static get title() {
        return 'Breakout';
    }

    // @override
    static get route() {
        return '/code/breakout';
    }

    static get summary() {
        return 'A randomly-generated Breakout game clone.';
    }

    // @override
    static get updateOnResize() {
        return true;
    }

    constructor() {
        super();
        this.stateDispatcher = new Dispatcher();
    }

    // @override
    render() {
        const blockSize = Math.min(
            (this.props.viewport.height - 2 * BREAKOUT_PADDING) / GRID_HEIGHT,
            this.props.viewport.width / GRID_WIDTH
        ).round();

        return createElement('div', null,
            createElement(BreakoutGrid, {
                stateDispatcher: this.stateDispatcher,
                blockSize: blockSize,
                m: GRID_HEIGHT,
                n: GRID_WIDTH
            }),
            createElement(BreakoutScore, {
                stateDispatcher: this.stateDispatcher
            }),
            createElement(Jade, {
                template: viewTemplate
            })
        );
    }

    // @override
    componentDidMount() {
        this.stateDispatcher.dispatch(STATES.initial);
    }
}
