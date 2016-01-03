import { createElement } from 'react';

import viewTemplate from 'views/code/forex';
import View from 'code/helpers/view';
import Jade from 'code/components/jade';

export default class CodeForex extends View {
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
        const { title, summary } = CodeForex;

        return createElement('div', null,
            createElement(Jade, { template: viewTemplate, data: { title, summary }}),
        );
    }
}
