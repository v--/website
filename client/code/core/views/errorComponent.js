import View from 'code/core/helpers/view';
import Jade from 'code/core/components/jade';
import viewTemplate from 'views/error';
import { MAILTO } from 'code/core/constants/contacts';
import { $ } from 'code/core/helpers/component';

export default class ErrorComponent extends View {
    // @override
    static get title() {
        return 'error';
    }

    static generate(error: Error) {
        return class ErrorComponentImpl extends ErrorComponent {
            // @override
            render() {
                return $(Jade, {
                    template: viewTemplate,
                    data: {
                        title: error.name,
                        message: error.message,
                        bugurl: `${MAILTO}?subject=ivasilev.net bug`
                    }
                });
            }
        };
    }

    static generateHeading() {
        return "";
    }

    static isError(view: Function) {
        return view.prototype instanceof ErrorComponent;
    }

    constructor() {
        super();

        if (this.constructor === View)
            throw new Error('Cannot directly instantiate, use View.generate');
    }

}
