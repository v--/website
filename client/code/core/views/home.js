import viewTemplate from 'views/home';
import View from 'code/core/helpers/view';
import Jade from 'code/core/components/jade';
import { CONTACTS } from 'code/core/constants/contacts';
import { $ } from 'code/core/helpers/component';

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
        return $(Jade, {
            template: viewTemplate, data: { contacts: CONTACTS }
        });
    }
}
