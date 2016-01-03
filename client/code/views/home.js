import { createElement } from 'react';

import viewTemplate from 'views/home';
import View from 'code/helpers/view';
import Jade from 'code/components/jade';
import { CONTACTS } from 'code/constants/contacts';

export default class Home extends View {
    // @override
    static get title() {
        return 'home';
    }

    // @override
    static get route() {
        return '';
    }

    // @override
    static get icon() {
        return 'home';
    }

    // @override
    static generateHeading() {
        return 'Welcome!';
    }

    // @override
    render() {
        return createElement(Jade, {
            template: viewTemplate, data: { contacts: CONTACTS }
        });
    }
}
