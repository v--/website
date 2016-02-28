import mediator from 'code/core/helpers/mediator';
import viewTemplate from 'views/code/breakout';
import View from 'code/core/helpers/view';
import Jade from 'code/core/components/jade';
import { $ } from 'code/core/helpers/component';

import Grid from 'code/breakout/components/grid';
import Score from 'code/breakout/components/score';
import { BREAKOUT_PADDING } from 'code/core/constants/style';
import { GRID_WIDTH, GRID_HEIGHT, STATES } from 'code/breakout/constants/config';

export default class Breakout extends View {
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

    // @override
    render() {
        const blockSize = Math.round(Math.min(
            (this.props.viewport.height - 2 * BREAKOUT_PADDING) / GRID_HEIGHT,
            this.props.viewport.width / GRID_WIDTH
        ));

        return $('div', null,
            $(Grid, {
                blockSize: blockSize,
                m: GRID_HEIGHT,
                n: GRID_WIDTH
            }),
            $(Score),
            $(Jade, {
                template: viewTemplate
            })
        );
    }

    // @override
    componentDidMount() {
        mediator.emit('breakout:state', STATES.initial);
    }
}
