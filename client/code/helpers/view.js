import { Component, PropTypes } from 'react';

import Viewport from 'code/helpers/viewport';

let resolveCounter = 0;

export default class View extends Component {
    static generate(title: string, route: string = '') {
        return class ViewImpl extends View {
            static propTypes = {
                viewport: PropTypes.instanceOf(Viewport).isRequired
            }

            static get title() {
                return title;
            }

            static get route() {
                return route;
            }
        };
    }

    static get title() {
        throw new Error('View#title must be overriden');
    }

    static get route() {
        throw new Error('View#route must be overriden');
    }

    static get icon() {
        return '';
    }

    static get updateOnResize() {
        return false;
    }

    static get hasSubviews() {
        return this.subviews !== View.subviews;
    }

    static isSubroute(subroute) {
        const splitted = { route: this.route, subroute }
            .mapValues(r => r.remove(/^\//).split('/'));

        return splitted.subroute.slice(0, splitted.route.length).equals(splitted.route);
    }

    static resolve(...args) {
        resolveCounter++;
        let resolveNumber = resolveCounter;

        // A basic promise canceller for avoiding sync problems
        return new Promise((resolve, reject) => {
            this.resolver(...args).then((...results) => {
                if (resolveNumber === resolveCounter)
                    resolve(...results);
            }, reject);
        });
    }

    static resolver() {
        return Promise.resolve({});
    }

    static routeData(data) {
        return data;
    }

    static subviews() {
        return [];
    }

    static isView(view: Function) {
        return view.prototype instanceof View;
    }

    static assertInstance(view: Function) {
        Object.assertInstance(View, view.prototype, true);
    }

    // React.PropTypes weirdness
    static propTypeCheck(view: Function) {
        try {
            Object.assertInstance(View, view.prototype, true);
        } catch (e) {
            return e;
        }

        return null;
    }
}
