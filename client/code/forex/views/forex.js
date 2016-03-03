import viewTemplate from 'views/core/code/forex';
import View from 'code/core/helpers/view';
import Jade from 'code/core/components/jade';
import { $ } from 'code/core/helpers/component';

export default class Forex extends View {
    // @override
    static get title() {
        return 'FOREX';
    }

    // @override
    static get route() {
        return '/code/forex';
    }

    static get summary() {
        return 'A comparison of FOREX market models.';
    }

    // @override
    render() {
        const { title, summary } = Forex;

        return $('div', null,
            $(Jade, { template: viewTemplate, data: { title, summary }}),
        );
    }
}
