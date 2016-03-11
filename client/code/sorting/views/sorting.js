import 'babel-regenerator-runtime';

import _ from 'lodash';
import ReactSlider from 'react-slider';

import mediator from 'code/core/helpers/mediator';
import viewTemplate from 'views/sorting/index';
import View from 'code/core/classes/view';
import Jade from 'code/core/components/jade';
import Demo from 'code/sorting/components/demo';
import algorithms from 'code/sorting/algos/index';
import { $ } from 'code/core/helpers/component';

export default class Sorting extends View {
    // @override
    static get title() {
        return 'Sorting';
    }

    // @override
    static get route() {
        return '/code/sorting';
    }

    static get summary() {
        return 'A visual comparison of array sorting algorithms.';
    }

    constructor() {
        super();
        this.state = { period: 16 };
    }

    // @override
    render() {
        const { title, summary } = Sorting;

        return $('div', null,
            $(Jade, { template: viewTemplate, data: { title, summary }}),
            $('div', { className: 'sorting-slider-container' },
                $('b', { className: 'sorting-slider-label' }, 'Animation speed: '),
                $(ReactSlider, {
                    onChange: ::this.updatePeriod,
                    min: 0,
                    max: 7,
                    step: 1,
                    defaultValue: 6,
                    withBars: true,
                    orientation: 'horizontal'
                })
            ),

            $('button', {
                onClick: ::this.sortAll,
                className: 'sorting-sortall'
            }, 'Sort all'),

            _.map(algorithms, (algorithm, index) =>
                $(Demo, { algorithm, key: index, period: this.state.period })
            )
        );
    }

    updatePeriod(value: number) {
        this.setState({ period: Math.pow(2, 10 - value) });
    }

    sortAll() {
        mediator.emit('sorting:all');
    }
}
