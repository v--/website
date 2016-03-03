import _ from 'lodash';

import { Component, props } from 'code/core/helpers/component';
import Viewport from 'code/core/helpers/viewport';
import CoolError from 'code/core/helpers/coolError';

let resolveCounter = 0;

export default class View extends Component {
    static generate(title: string, route: string = '', summary: string = '') {
        return class ViewImpl extends View {
            static propTypes = {
                viewport: props.instanceOf(Viewport).isRequired
            }

            static get title() {
                return title;
            }

            static get route() {
                return route;
            }

            static get summary() {
                return summary;
            }

            static generateHeading() {
                return summary;
            }
        };
    }

    static get title() {
        pre: this.constructor !== View;
    }

    static get route() {
        pre: this.constructor !== View;
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

    static generateHeading() {
        return this.title;
    }

    static isSubroute(subroute) {
        const splitted = _.mapValues({ route: this.route, subroute }, r => r.replace(/^\//, '').split('/'));
        return _.isEqual(splitted.subroute.slice(0, splitted.route.length), splitted.route);
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
        if (view.prototype instanceof View) {
            return;
        }

        throw new CoolError();
    }

    // React.PropTypes weirdness
    static propTypeCheck(view: Function) {
        if (view.prototype instanceof View) {
            return null;
        }

        return new CoolError();
    }
}
